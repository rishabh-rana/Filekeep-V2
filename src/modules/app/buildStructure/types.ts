import { ParsedQueryMap } from "../../../middlewares/structuralSearchQuery/types";

export const SEND_STRUCTURAL_SEARCH_QUERY = "sendStructuralSearchQuery";
export const RECIEVED_FIRESTORE_RESPONSE = "receivedFirestoreResponse";
export const SYNC_UNSUBSCRIBE_LISTENERS = "syncUnsubscribeListeners";
export const BUILD_MAIN_STRUCTURE_MAP = "buildMainStructureMap";

type tagId = string;
type ListStructureMap = Map<tagId, string[]>;
export type MainStructureMap = Map<tagId, ListStructureMap>;

export interface ISearchState {
  unsubscribeListeners: (() => void)[];
  mainStructure: MainStructureMap;
  mainDataStore: { [tag: string]: IFireStoreResponse };
}

export interface IStructuralSearchQueryData {
  inputParser: string[];
  activeCompany: string;
}
export interface IFireStoreResponse {}

export interface IParsedFirestoreResponse {
  [tagId: string]: IFireStoreResponse;
}

export interface ISendStructuralSearchQueryAction {
  type: typeof SEND_STRUCTURAL_SEARCH_QUERY;
  payload: IStructuralSearchQueryData;
}

export interface IReceivedFirestoreResponseAction {
  type: typeof RECIEVED_FIRESTORE_RESPONSE;
  payload: IParsedFirestoreResponse;
}

export interface ISyncUnsubscribeListenersAction {
  type: typeof SYNC_UNSUBSCRIBE_LISTENERS;
  payload: () => void;
}

export interface IBuildMainStructureMapAction {
  type: typeof BUILD_MAIN_STRUCTURE_MAP;
  payload: ParsedQueryMap;
}

// export interface IStructuralSearchQuery_ViewOptions {
//   displayType: string;
//   structureBy: string;
// }
