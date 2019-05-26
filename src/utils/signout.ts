import { auth } from "../config/firebase";
import store from "../store";
import { SyncUsers } from "../modules/auth/actionCreator";
import { SyncActiveCompany } from "../modules/appActionCreator";

export const signoutAndCleanup = () => {
  auth.signOut();
  store.dispatch(
    SyncUsers({
      displayName: "User",
      uid: null
    })
  );
  store.dispatch(SyncActiveCompany(""));
  localStorage.removeItem("uid");
  localStorage.removeItem("displayName");
  localStorage.removeItem("activeCompany");
};
