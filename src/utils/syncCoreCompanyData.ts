import { firestore } from "../config/firebase";
import store from "../store";
import { COMPANIES_COLLECTION } from "../config/firestore_constants";

interface IRequiredState {
  state: any;
}

const getRequiredState = (): IRequiredState => {
  const state = store.getState();
  return { state };
};

interface ICoreData {}

export const GetCoreData = async (): Promise<ICoreData | null> => {
  const state = getRequiredState();
  const activeCompany = localStorage.getItem("activeCompany");

  if (!activeCompany) return null;

  const doc = await firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .get();
  const companyData = doc.data();

  return {};
};
