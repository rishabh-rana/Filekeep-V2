import firebase from "firebase/app";
import { SyncUsers } from "../../modules/auth/actionCreator";
import store from "../../store";
import mixpanel from "../../config/mixpanel";
import { FOUND_MESSING_WITH_CODE } from "../../config/mixpanelConstants";
import { signoutAndCleanup } from "./signout";

const getUidInState = (): string | null => {
  const state = store.getState();
  return state.authenticationState.uid;
};

export const LogoutAfterTimeout = () => {
  const unsubscribe = firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      signoutAndCleanup();
    }
  });
  return unsubscribe;
};

export const verifyLogin = (): any => {
  const unsubscribe: any = firebase.auth().onAuthStateChanged(user => {
    const uidInState = getUidInState();
    const uidInLocalStorage = localStorage.getItem("uid");

    if (user) {
      // if uid doesnt exist in local store or state, or uid mismatched, set correct value
      if (
        !uidInLocalStorage ||
        uidInLocalStorage !== user.uid ||
        uidInLocalStorage !== uidInState ||
        !uidInState
      ) {
        mixpanel.track(FOUND_MESSING_WITH_CODE);
        console.log("Corrected wrong UID");
        store.dispatch(
          SyncUsers({
            displayName:
              user.displayName || localStorage.getItem("displayName") || "User",
            uid: user.uid
          })
        );
        localStorage.setItem("uid", user.uid);
      }
    } else {
      // if uid exist in state or in localstore, flush it clean
      if (uidInState || uidInLocalStorage) {
        console.log("Signed Out Session");
        mixpanel.track(FOUND_MESSING_WITH_CODE);
        signoutAndCleanup();
      }
    }

    unsubscribe();
  });
};
