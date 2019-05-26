export const SEND_STRUCTURAL_SEARCH_QUERY = "sendStructuralSearchQuery";
export const RECIEVED_FIRESTORE_RESPONSE = "receivedFirestoreResponse";
export const SYNC_UNSUBSCRIBE_LISTENERS = "syncUnsubscribeListeners";
export const BUILD_MAIN_STRUCTURE_MAP = "buildMainStructureMap";

export interface IStructuralSearchQueryData {
  inputParser: string[];
  activeCompany: string;
}

export interface ISendStructuralSearchQueryAction {
  type: typeof SEND_STRUCTURAL_SEARCH_QUERY;
  payload: IStructuralSearchQueryData;
}

export interface IFireStoreResponse {}

export interface IReceivedFirestoreResponseAction {
  type: typeof RECIEVED_FIRESTORE_RESPONSE;
  payload: IFireStoreResponse;
}

export interface ISyncUnsubscribeListenersAction {
  type: typeof SYNC_UNSUBSCRIBE_LISTENERS;
  payload: () => void;
}

export interface ISearchState {
  unsubscribeListeners: (() => void)[];
  primeStructure: Map<any, any>;
}

// export interface IStructuralSearchQuery_ViewOptions {
//   displayType: string;
//   structureBy: string;
// }
