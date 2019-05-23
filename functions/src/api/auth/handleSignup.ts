import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {
  COMPANIES_COLLECTION,
  SHARED_PROJECTS,
  COMPANY_VALIDATION_COLLECTION,
  USERS_SUBCOLLECTION,
  USER_COLLECTION
} from "../../firestoreConstants";
import { HttpsError } from "firebase-functions/lib/providers/https";

const db = admin.firestore();

// 15 days
const TrialPeriod = 1296000000;

interface IValidationData {
  expires: number;
  trial: boolean;
}

const validationDoc: IValidationData = {
  trial: true,
  expires: Date.now() + TrialPeriod
};

export const handleSignup = async (
  data: undefined,
  context: functions.https.CallableContext
): Promise<any> => {
  if (context.auth && context.auth.uid) {
    // set a ref on the companyData
    const ref = db.collection(COMPANY_VALIDATION_COLLECTION).doc();

    // setCompanyValidation Data, setting it up as a Trial of 15 days

    db.collection(COMPANY_VALIDATION_COLLECTION)
      .doc(ref.id)
      .set(validationDoc)
      .catch(() => {
        throw new HttpsError("unavailable", "Cannot validate new company data");
      });

    db.collection(USER_COLLECTION)
      .doc(context.auth.uid)
      .set(
        {
          [SHARED_PROJECTS]: {
            [ref.id]: true
          },
          validation_data: {
            [ref.id]: validationDoc
          }
        },
        { merge: true }
      )
      .catch(() => {
        throw new HttpsError("unavailable", "Cannot update user schema");
      });

    // update role inside the company user's profile

    db.collection(COMPANIES_COLLECTION)
      .doc(ref.id)
      .collection(USERS_SUBCOLLECTION)
      .doc(context.auth.uid)
      .set({
        role: "owner"
      })
      .catch(() => {
        throw new HttpsError("unavailable", "Cannot update user schema");
      });

    db.collection(COMPANIES_COLLECTION)
      .doc(ref.id)
      .set({
        created: Date.now(),
        edit_rights: [context.auth.uid]
      });

    return {
      newCompanyId: ref.id
    };
  } else {
    throw new HttpsError("unauthenticated", "Unauthorized");
  }
};
