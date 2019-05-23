import { messaging, firestore } from "../config/firebase";
import {
  USER_COLLECTION,
  INFORMATION_SUBCOLLECTION,
  PRIVATE_INFORMATION
} from "../config/firestoreConstants";
import store from "../store";
import { throwErrorCreator } from "../modules/error/errorActionCreator";
import { colors } from "../colors";

const requestPermissionForPush = async (uid: string) => {
  const doc = await firestore
    .collection(USER_COLLECTION)
    .doc(uid)
    .collection(INFORMATION_SUBCOLLECTION)
    .doc(PRIVATE_INFORMATION)
    .get();

  const data = doc.data();

  // check if permission is granted
  messaging
    .requestPermission()
    .then(function() {
      messaging
        .getToken()
        .then(function(currentToken) {
          if (currentToken && (!data || currentToken !== data.gcm_token)) {
            firestore
              .collection(USER_COLLECTION)
              .doc(uid)
              .collection(INFORMATION_SUBCOLLECTION)
              .doc(PRIVATE_INFORMATION)
              .set(
                {
                  gcm_token: currentToken
                },
                { merge: true }
              );
          } else {
            // do nothing
          }
        })
        .catch(function(err) {
          console.log("An error occurred while retrieving token. ", err);
        });
    })
    .catch(function(err) {
      console.log("Unable to get permission to notify.", err);
    });
};

export const setupPushNotifications = (uid: string) => {
  // request permissions
  requestPermissionForPush(uid);

  // check for token refreshes
  messaging.onTokenRefresh(function() {
    messaging
      .getToken()
      .then(function(refreshedToken) {
        if (refreshedToken) {
          localStorage.setItem("pushPermission", refreshedToken);

          firestore
            .collection(USER_COLLECTION)
            .doc(uid)
            .collection(INFORMATION_SUBCOLLECTION)
            .doc(PRIVATE_INFORMATION)
            .update({
              gcm_token: refreshedToken
            });
        } else {
          throw new Error();
        }
      })
      .catch(function(err) {
        console.log("Unable to retrieve refreshed token ", err);
      });
  });

  const handleForegroundNotif = (payload: any) => {
    store.dispatch(
      throwErrorCreator({
        color: colors.primary,
        message: payload.notification.body
      })
    );
  };

  // handle foreground notifs
  messaging.onMessage(function(payload) {
    handleForegroundNotif(payload);

    // ...
  });
};
