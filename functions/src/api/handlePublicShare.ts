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
            throw new HttpsError(
              "unavailable",
              "Cannot access user collection"
            );
          });

        const data1 = doc.data();
        if (data1) {
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
          throw new HttpsError("unavailable", "Cannot access private assets");
        });
      const data2 = doc.data();
      if (data2) {
        resolve(data2[PUBLIC_STRUCTURE] as IRawPrivateStructureObject[]);
      } else {
        resolve(false);
      }
    });
    const privateStructurePromise = new Promise<
      | {
          privateStructure: IRawPrivateStructureObject[];
          securityMap: { [key: string]: true };
        }
      | false
    >(async (resolve, reject) => {
      const doc = await db
        .collection(COMPANIES_COLLECTION)
        .doc(activeCompany)
        .collection(USERS_SUBCOLLECTION)
        //@ts-ignore
        .doc(context.auth.uid)
        .get()
        .catch(() => {
          throw new HttpsError("unavailable", "Cannot access shared assets");
        });
      const data3 = doc.data();
      if (data3) {
        //@ts-ignore
        resolve({
          privateStructure: data3[
            PRIVATE_STRUCTURE
          ] as IRawPrivateStructureObject[],
          securityMap: data3["security_map"] as { [key: string]: true }
        });
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
    } else if (!Values[1]) {
      throw new HttpsError("unavailable", "No public assets found");
    }

    const publicStructure = Values[1];
    const privateDocValues = Values[2];
    let privateStructure: IRawPrivateStructureObject[] | false = false;
    let securityMap: { [key: string]: true } = {};

    if (privateDocValues) {
      ({ securityMap, privateStructure } = privateDocValues);
    }

    if (!securityMap) securityMap = {};

    const privateStructureMap: RawPrivateStructureMap = {};

    // if there was some data on the shared side, make a copy, else leave the object blank
    if (privateStructure) {
      privateStructure.forEach(obj => {
        const { tag } = obj;
        if (deletionMap[tag] && deletionMap[tag].mainTag) {
          // do nothing, as in do not copy data over from the sharedStructure as this data is deleted
        } else {
          privateStructureMap[tag] = obj;
          // setup security strings
          obj.parents.forEach(parentId => {
            securityMap[tag + "$" + parentId] = true;
          });
        }
        if (deletionMap[tag] && deletionMap[tag].parents) {
          //@ts-ignore
          deletionMap[tag].parents.forEach(parentId => {
            delete securityMap[tag + "$" + parentId];
          });
        }
      });
    }
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
      // handle security string addition
      obj.parents.forEach(parentId => {
        securityMap[tag + "$" + parentId] = true;
      });
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
        [PRIVATE_STRUCTURE]: finalArray,
        security_map: securityMap
      })
      .catch(() => {
        throw new HttpsError("unavailable", "Cannot update shared assets");
      });
    return {
      done: true
    };
  } else {
    throw new HttpsError("unauthenticated", "Unauthorized");
  }
};
