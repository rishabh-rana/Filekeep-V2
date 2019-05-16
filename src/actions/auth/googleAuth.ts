// import types
import { ThunkAction } from "redux-thunk";
import { AppState } from "../../reducers/index";
import { Action } from "redux";
import { IUserData } from "../../types/store/auth";

// import actionCreators
import { SyncUsers } from "./actionCreator";
import { throwErrorCreator } from "../error/actionCreator";
// import firebase, mixpanel APIs
import { auth, per, provider, firestore } from "../../config/firebase";
import mixpanel from "../../config/mixpanel";
//import firebase, mixpanel constants
import { USER_COLLECTION } from "../../config/firestore_constants";
import { TRACK_SIGNIN } from "../../config/mixpanel_constants";

export const signInWithGoogle = (): ThunkAction<
  void,
  AppState,
  null,
  Action<string>
> => {
  return async dispatch => {
    console.log(Date.now());
    await auth.setPersistence(per);
    console.log(Date.now());
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
          .set({
            displayName: result.user.displayName,
            lastSignIn: Date.now()
          });
      } catch (error) {
        // DISPATCH OFFLINE SYNC ACTION
      }

      dispatch(
        SyncUsers({
          uid: result.user.uid,
          displayName: result.user.displayName || "User"
        })
      );
    } else {
      // dispatch error handler
      dispatch(
        throwErrorCreator({
          message: "Cannot Sign-in at the moment, please try again"
        })
      );
    }
  };
};

export const SyncUsersManual = (
  userData: IUserData
): ThunkAction<void, AppState, null, Action<string>> => {
  return dispatch => {
    console.log("Syncing Users Manually");
    dispatch(SyncUsers(userData));
  };
};
