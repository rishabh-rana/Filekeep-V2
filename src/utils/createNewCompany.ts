import { functions, firestore } from "../config/firebase";
import {
  USER_COLLECTION,
  INFORMATION_SUBCOLLECTION,
  PRIVATE_INFORMATION
} from "../config/firestoreConstants";
import { getVariableServerPaths } from "./getVariableServerPaths";
import store from "../store";
import {
  SyncActiveCompany,
  SyncSetupCompany
} from "../modules/appActionCreator";

export const createNewCompany = async (uidOpt?: { uid: string }) => {
  const handleSignup = functions.httpsCallable("handleSignup");
  const { data } = await handleSignup();
  const { uid } = uidOpt ? uidOpt : await getVariableServerPaths();

  // set active project
  if (data.newCompanyId && uid) {
    firestore
      .collection(USER_COLLECTION)
      .doc(uid)
      .collection(INFORMATION_SUBCOLLECTION)
      .doc(PRIVATE_INFORMATION)
      .set({
        active_project: data.newCompanyId,
        last_active: Date.now()
      });
    localStorage.setItem("activeCompany", data.newCompanyId);
    store.dispatch(SyncActiveCompany(data.newCompanyId));
    console.log("CREATED NEW CONPANY");
    store.dispatch(SyncSetupCompany(true));
  }
};
