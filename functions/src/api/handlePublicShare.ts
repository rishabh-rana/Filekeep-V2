import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { HttpsError } from "firebase-functions/lib/providers/https";
import {
  COMPANIES_COLLECTION,
  USER_COLLECTION,
  USERS_SUBCOLLECTION,
  SHARED_PROJECTS
} from "../firestoreConstants";
import {
  PUBLIC_STRUCTURE,
  IRawPrivateStructureObject,
  PRIVATE_STRUCTURE,
  RawPrivateStructureMap,
  IDeletionMap
} from "./appTypes";

const db = admin.firestore();

interface IData {
  deletionMap: IDeletionMap;
  activeCompany: string;
}

export const handlePublicShare = async (
  data: IData,
  context: functions.https.CallableContext
) => {
  if (context.auth && context.auth.uid) {
    const { deletionMap, activeCompany } = data;

    const checkActiveCompanyPromise = new Promise<boolean>(
      async (resolve, reject) => {
        const doc = await db
          .collection(USER_COLLECTION)
          //@ts-ignore
          .doc(context.auth.uid)
          .get()
          .catch(() => {
            throw new HttpsError("unavailable", "Try later");
          });
        const data = doc.data();
        if (data) {
          //@ts-ignore
          resolve(data[SHARED_PROJECTS].hasOwnProperty(context.auth.uid));
        } else {
          resolve(false);
        }
      }
    );
    const publicStructurePromise = new Promise<
      IRawPrivateStructureObject[] | false
    >(async (resolve, reject) => {
      const doc = await db
        .collection(COMPANIES_COLLECTION)
        .doc(activeCompany)
        .get()
        .catch(() => {
          throw new HttpsError("unavailable", "Try later");
        });
      const data = doc.data();
      if (data) {
        resolve(data[PUBLIC_STRUCTURE] as IRawPrivateStructureObject[]);
      } else {
        resolve(false);
      }
    });
    const privateStructurePromise = new Promise<
      IRawPrivateStructureObject[] | false
    >(async (resolve, reject) => {
      const doc = await db
        .collection(COMPANIES_COLLECTION)
        .doc(activeCompany)
        .collection(USERS_SUBCOLLECTION)
        //@ts-ignore
        .doc(context.auth.uid)
        .get()
        .catch(() => {
          throw new HttpsError("unavailable", "Try later");
        });
      const data = doc.data();
      if (data) {
        //@ts-ignore
        resolve(data[PRIVATE_STRUCTURE] as IRawPrivateStructureObject[]);
      } else {
        resolve(false);
      }
    });

    const Values = await Promise.all([
      checkActiveCompanyPromise,
      publicStructurePromise,
      privateStructurePromise
    ]);

    if (!Values[0]) {
      throw new HttpsError(
        "permission-denied",
        "You dont have permission to operate on this company"
      );
    } else if (!Values[1] || !Values[2]) {
      throw new HttpsError(
        "unavailable",
        "You dont have permission to operate on this company"
      );
    }

    const publicStructure = Values[1];
    const privateStructure = Values[2];

    const privateStructureMap: RawPrivateStructureMap = {};

    privateStructure.forEach(obj => {
      const { tag } = obj;
      if (deletionMap[tag] && deletionMap[tag].mainTag) {
        // do nothing, as in do not copy data over from the sharedStructure as this data is deleted
      } else {
        privateStructureMap[tag] = obj;
      }
    });

    publicStructure.forEach(obj => {
      const { tag } = obj;
      if (privateStructureMap.hasOwnProperty(tag)) {
        //take union of parents and handle any deletions
        const publicParents = obj.parents;
        const privateParents = privateStructureMap[tag].parents;
        const helper: any = {};
        [...publicParents, ...privateParents].forEach(tag => {
          helper[tag] = true;
        });

        if (deletionMap[tag] && deletionMap[tag].parents) {
          //@ts-ignore
          deletionMap[tag].parents.forEach(deleteTag => {
            delete helper[deleteTag];
          });
        }

        privateStructureMap[tag] = {
          tag,
          parents: Object.keys(helper)
        };
      } else {
        // this is new entry, add directly
        privateStructureMap[tag] = obj;
      }
    });

    const finalArray: IRawPrivateStructureObject[] = [];

    Object.keys(privateStructureMap).forEach(tag => {
      finalArray.push(privateStructureMap[tag]);
    });

    db.collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .collection(USERS_SUBCOLLECTION)
      .doc(context.auth.uid)
      .update({
        [PRIVATE_STRUCTURE]: finalArray
      })
      .catch(() => {
        throw new HttpsError("unavailable", "Try later");
      });

    return {
      done: true
    };
  } else {
    throw new HttpsError("unauthenticated", "Unauthorized");
  }
};