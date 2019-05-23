import { Dispatch } from "redux";
import { per, auth, provider, firestore } from "../../config/firebase";
import {
  USER_COLLECTION,
  INFORMATION_SUBCOLLECTION,
  PRIVATE_INFORMATION,
  PUBLIC_INFORMATION
} from "../../config/firestoreConstants";
import { SyncUsers } from "../../modules/auth/authActionCreator";
import mixpanel from "../../config/mixpanel";
import { TRACK_SIGNIN } from "../../config/mixpanelConstants";
import { throwErrorCreator } from "../../modules/error/errorActionCreator";
import { createNewCompany } from "../../utils/createNewCompany";

export const signInWithGoogle = async (dispatch: Dispatch) => {
  await auth.setPersistence(per);
  var result = await auth.signInWithPopup(provider);

  if (
    result &&
    result.user &&
    result.additionalUserInfo &&
    !result.additionalUserInfo.isNewUser
  ) {
    // old user detected
    try {
      firestore
        .collection(USER_COLLECTION)
        .doc(result.user.uid)
        .collection(INFORMATION_SUBCOLLECTION)
        .doc(PRIVATE_INFORMATION)
        .update({
          lastSignIn: Date.now()
        });
    } catch (error) {
      // ignore adding lastSignIn time
    }
    // dispatch the signin Details
    dispatch(
      SyncUsers({
        uid: result.user.uid,
        displayName: result.user.displayName || "User"
      })
    );
  } else if (
    result &&
    result.user &&
    result.additionalUserInfo &&
    result.additionalUserInfo.isNewUser
  ) {
    // fresh user signup

    // alias mixpanel and set required properties on mixpanel console
    mixpanel.alias(result.user.uid);
    mixpanel.people.set({
      $name: result.user.displayName || "User",
      $email: result.user.email || "email not grabbed",
      $creationtime: Date.now()
    });
    mixpanel.track(TRACK_SIGNIN);

    try {
      firestore
        .collection(USER_COLLECTION)
        .doc(result.user.uid)
        .collection(INFORMATION_SUBCOLLECTION)
        .doc(PUBLIC_INFORMATION)
        .set({
          displayName: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL
        });
    } catch (error) {
      // err
    }

    dispatch(
      SyncUsers({
        uid: result.user.uid,
        displayName: result.user.displayName || "User"
      })
    );
    // execute the actual sugnup logic after dispatch, to update app state instantaneously
    createNewCompany({ uid: result.user.uid });
  } else {
    // dispatch error handler
    dispatch(
      throwErrorCreator({
        message: "Cannot Sign-in at the moment, please try again"
      })
    );
  }
};
