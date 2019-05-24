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
        const data1 = doc.data();
        if (data1) {
          console.log(
            "isActiveCompanyCorrect",
            //@ts-ignore
            data1[SHARED_PROJECTS].hasOwnProperty(activeCompany)
          );
          //@ts-ignore
          resolve(data1[SHARED_PROJECTS].hasOwnProperty(activeCompany));
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
      const data2 = doc.data();
      if (data2) {
        console.log("public data got");
        resolve(data2[PUBLIC_STRUCTURE] as IRawPrivateStructureObject[]);
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
      const data3 = doc.data();
      if (data3) {
        //@ts-ignore
        console.log("private data got");
        resolve(data3[PRIVATE_STRUCTURE] as IRawPrivateStructureObject[]);
      } else {
        resolve(false);
      }
    });

    const Values = await Promise.all([
      checkActiveCompanyPromise,
      publicStructurePromise,
      privateStructurePromise
    ]);

    console.log("values got");

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

    console.log("built privateMap");

    publicStructure.forEach(obj => {
      const { tag } = obj;
      if (privateStructureMap.hasOwnProperty(tag)) {
        //take union of parents and handle any deletions
        const publicParents = obj.parents;
        const privateParents = privateStructureMap[tag].parents;
        const helper: any = {};
        [...publicParents, ...privateParents].forEach(tag1 => {
          helper[tag1] = true;
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

    console.log("took unions");

    const finalArray: IRawPrivateStructureObject[] = [];

    Object.keys(privateStructureMap).forEach(tag => {
      finalArray.push(privateStructureMap[tag]);
    });

    console.log("tried updating private structure");
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
