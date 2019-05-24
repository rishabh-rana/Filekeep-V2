import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

import { handleSignup } from "./api/auth/handleSignup";
import { HttpsError } from "firebase-functions/lib/providers/https";
import { handlePublicShare } from "./api/handlePublicShare";

exports.handleSignup = functions.https.onCall((data, context) => {
  return handleSignup(data, context).catch(() => {
    throw new HttpsError("unavailable", "Something went wrong");
  });
});

exports.handlePublicShare = functions.https.onCall((data, context) => {
  return handlePublicShare(data, context).catch(() => {
    throw new HttpsError("unauthenticated", "Something went wrong");
  });
});

const TrialNotif = require("./trialNotification");

// this is a trial functions to supply fcm notifications when a new doc is created
// under the trial subcollection having uid field equal to uid of receiver
exports.onChangeNotify = functions.firestore
  .document("/trial/{id}")
  .onCreate(TrialNotif.handler);
