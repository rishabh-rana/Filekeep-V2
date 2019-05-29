import { functions } from "../config/firebase";
import store from "../store";
import {
  SyncSetupCompany,
  SyncActiveCompanyForSetup
} from "../modules/appActionCreator";

export const createNewCompany = async (uid: string) => {
  store.dispatch(SyncSetupCompany(true));
  const handleSignup = functions.httpsCallable("handleSignup");
  const { data } = await handleSignup();

  // set active project
  if (data.newCompanyId && uid) {
    localStorage.setItem("activeCompany", data.newCompanyId);
    store.dispatch(SyncActiveCompanyForSetup(data.newCompanyId));
  }
  return;
};
