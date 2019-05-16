import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

const TrialNotif = require("./trialNotification");

// this is a trial functions to supply fcm notifications when a new doc is created
// under the trial subcollection having uid field equal to uid of receiver
exports.onChangeNotify = functions.firestore
  .document("/trial/{id}")
  .onCreate(TrialNotif.handler);
