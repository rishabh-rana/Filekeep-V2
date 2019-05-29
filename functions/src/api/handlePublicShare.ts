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
  PRIVATE_STRUCTURE,
  IChangeMap,
  IServerPrivateStructureObject
} from "./appTypes";

const db = admin.firestore();

interface IData {
  changeMap: IChangeMap;
  activeCompany: string;
}

export const handlePublicShare = async (
  data: IData,
  context: functions.https.CallableContext
) => {
  if (context.auth && context.auth.uid) {
    const { changeMap, activeCompany } = data;

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

    // get private doc of the user
    const privateStructurePromise = new Promise<IServerPrivateStructureObject>(
      async (resolve, reject) => {
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
        if (data3 && data3[PRIVATE_STRUCTURE]) {
          //@ts-ignore
          resolve(data3[PRIVATE_STRUCTURE] as IServerPrivateStructureObject);
        } else {
          resolve({} as IServerPrivateStructureObject);
        }
      }
    );

    const Values = await Promise.all([
      checkActiveCompanyPromise,
      privateStructurePromise
    ]);

    if (!Values[0]) {
      throw new HttpsError(
        "permission-denied",
        "You dont have permission to operate on this company"
      );
    }

    let privateStructure = Values[1];

    // delete deletions
    changeMap.deletions.forEach(tag => {
      delete privateStructure[tag];
    });
    // add insertions

    privateStructure = { ...privateStructure, ...changeMap.insertions };

    db.collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .collection(USERS_SUBCOLLECTION)
      .doc(context.auth.uid)
      .update({
        [PRIVATE_STRUCTURE]: privateStructure
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
