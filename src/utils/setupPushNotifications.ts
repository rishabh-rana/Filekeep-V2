import { messaging, firestore } from "../config/firebase";
import { USER_COLLECTION } from "../typesAndConstants/firestoreConstants";
import store from "../store";
import { throwErrorCreator } from "../modules/error/errorActionCreator";
import { colors } from "../colors";

const requestPermissionForPush = async (uid: string) => {
  const doc = await firestore
    .collection(USER_COLLECTION)
    .doc(uid)
    .get();

  const data = doc.data();
  if (data) {
    // check if permission is granted
    messaging
      .requestPermission()
      .then(function() {
        messaging
          .getToken()
          .then(function(currentToken) {
            if (currentToken && currentToken !== data.gcm_token) {
              firestore
                .collection(USER_COLLECTION)
                .doc(uid)
                .update({
                  gcm_token: currentToken
                });
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
  }
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
            .collection("users")
            .doc(uid)
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
