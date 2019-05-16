import * as admin from "firebase-admin";

const db = admin.firestore();

export async function sendNotification(
  userId: string,
  notifTitle: string,
  description: string,
  data: any
) {
  // writeNotificationToDB(userId, notifTitle, description, data);
  let userDocument = db.collection("users").doc(userId);
  await userDocument
    .get()
    .then(async document => {
      if (document != null && document != undefined) {
        let gcm_token: string = document.get("gcm_token");
        if (
          gcm_token != null &&
          gcm_token != undefined &&
          gcm_token.length != 0
        ) {
          var message = {
            notification: {
              title: notifTitle,
              body: description
            },
            webpush: {
              notification: {
                body: description
              }
            },
            token: gcm_token
          };
          console.log(gcm_token);
          await admin
            .messaging()
            .send(message)
            .then((response: any) => {
              return new Promise((resolve, reject) => {
                console.log("Sent NOtif");
                resolve(true);
              });
            })
            .catch((err: any) => {
              return new Promise((resolve, reject) => {
                resolve(false);
              });
            });
        }
      }
      // return true;
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    })
    .catch(err => {
      return new Promise((resolve, reject) => {
        resolve(false);
      });
      //        return false;
    });
}
