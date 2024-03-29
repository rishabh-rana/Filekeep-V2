import store from "../store";
import { firestore } from "../config/firebase";
import {
  USER_COLLECTION,
  INFORMATION_SUBCOLLECTION,
  PRIVATE_INFORMATION
} from "../config/firestoreConstants";
import { SyncActiveCompany } from "../modules/appActionCreator";

interface IReturns {
  uid: string | null;
  activeCompany: string | null;
}

export const getVariableServerPaths = async (): Promise<IReturns> => {
  const state = store.getState();
  let activeCompany = state.app.appCore.activeCompany;

  const uid = state.authenticationState.uid;
  // if active company is not found in state
  if (!activeCompany && uid) {
    // check localstorage
    activeCompany = localStorage.getItem("activeCompany");
    if (!activeCompany) {
      // still not there, search server
      activeCompany = await updateActiveCompany(uid);
    }
  }

  return {
    uid,
    activeCompany
  };
};

export const updateActiveCompany = async (
  uid: string
): Promise<string | null> => {
  console.log("ERROR ONE O ONE");
  if (uid) {
    const userDoc = await firestore
      .collection(USER_COLLECTION)
      .doc(uid)
      .collection(INFORMATION_SUBCOLLECTION)
      .doc(PRIVATE_INFORMATION)
      .get();
    const data = userDoc.data();
    if (data && data.active_project) {
      localStorage.setItem("activeCompany", data.active_project);
      store.dispatch(SyncActiveCompany(data.active_project));
      return data.active_project;
    }
  }
  return null;
};
