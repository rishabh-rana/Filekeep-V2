import { functions, firestore } from "../config/firebase";
import {
  USER_COLLECTION,
  INFORMATION_SUBCOLLECTION,
  PRIVATE_INFORMATION
} from "../config/firestoreConstants";
import store from "../store";
import { SyncSetupCompany } from "../modules/appActionCreator";

export const createNewCompany = async (uid: string) => {
  store.dispatch(SyncSetupCompany(true));
  const handleSignup = functions.httpsCallable("handleSignup");
  const { data } = await handleSignup();

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
  }

  return;
};
