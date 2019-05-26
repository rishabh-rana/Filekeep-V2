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
  PRIVATE_STRUCTURE,
  IDeletionMap,
  IServerPrivateStructureObject
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
    console.log(deletionMap);
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
      IServerPrivateStructureObject | false
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
        resolve(data2[PUBLIC_STRUCTURE] as IServerPrivateStructureObject);
      } else {
        resolve(false);
      }
    });
    const privateStructurePromise = new Promise<{
      privateStructure: IServerPrivateStructureObject;
      securityMap: { [key: string]: true };
    }>(async (resolve, reject) => {
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
      if (data3 && data3[PRIVATE_STRUCTURE] && data3["security_map"]) {
        //@ts-ignore
        resolve({
          privateStructure: data3[
            PRIVATE_STRUCTURE
          ] as IServerPrivateStructureObject,
          securityMap: data3["security_map"] as { [key: string]: true }
        });
      } else {
        resolve({
          privateStructure: {} as IServerPrivateStructureObject,
          securityMap: {} as { [key: string]: true }
        });
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
    } else if (!Values[1]) {
      throw new HttpsError("unavailable", "No public assets found");
    }

    const publicStructure = Values[1];
    const privateDocValues = Values[2];
    let { privateStructure, securityMap } = privateDocValues;

    console.log(privateStructure, securityMap, "Fine HERE");

    if (Object.keys(privateStructure).length > 0) {
      Object.keys(deletionMap).forEach(tagToBeDeleted => {
        if (deletionMap[tagToBeDeleted].mainTag) {
          // @ts-ignore
          delete privateStructure[tagToBeDeleted];
        } else if (deletionMap[tagToBeDeleted].parents && privateStructure) {
          //@ts-ignore
          Object.keys(deletionMap[tagToBeDeleted].parents).forEach(
            (parentTobedeleted: string) => {
              //@ts-ignore
              delete privateStructure[tagToBeDeleted].parents[
                parentTobedeleted
              ];
            }
          );
        }
      });
    }
    console.log("JBYVJBKNNH");
    Object.keys(publicStructure).forEach(tag => {
      const publicObject = publicStructure[tag];
      if (privateStructure[tag] !== undefined) {
        // add any new parents here
        const publicParents = publicObject.parents;

        Object.keys(publicParents).forEach(item => {
          privateStructure[tag].parents[item] = true;
        });
      } else {
        privateStructure[tag] = publicObject;
      }

      Object.keys(publicObject.parents).forEach(parentId => {
        securityMap[tag + "$" + parentId] = true;
      });
    });
    console.log("yo");
    db.collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .collection(USERS_SUBCOLLECTION)
      .doc(context.auth.uid)
      .update({
        [PRIVATE_STRUCTURE]: privateStructure,
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
