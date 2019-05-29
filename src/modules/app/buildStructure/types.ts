export const SEND_STRUCTURAL_SEARCH_QUERY = "sendStructuralSearchQuery";
export const RECIEVED_FIRESTORE_RESPONSE = "receivedFirestoreResponse";
export const SYNC_UNSUBSCRIBE_LISTENERS = "syncUnsubscribeListeners";
export const BUILD_MAIN_STRUCTURE_MAP = "buildMainStructureMap";

export interface MainStructureMap {
  [listId: string]: {
    header: string;
    nodes: IFireStoreResponse[];
  };
}

export interface ISearchState {
  unsubscribeListeners: (() => void)[];
  mainStructure: MainStructureMap;
  mainDataStore: { [tag: string]: IFireStoreResponse };
}

export interface IParsedQuery {
  tagids: string[];
  type: "c" | "p";
}

export type ParsedQueries = IParsedQuery[];

export interface IStructuralSearchQueryData {
  parsedQueries: ParsedQueries;
  activeCompany: string;
}
export interface IFireStoreResponse {
  id: string;
  nodeId: string;
  deletionMode?: boolean;
  [fieldData: string]: any;
}

export interface ISendStructuralSearchQueryAction {
  type: typeof SEND_STRUCTURAL_SEARCH_QUERY;
  payload: IStructuralSearchQueryData;
}

export interface IReceivedFirestoreResponseAction {
  type: typeof RECIEVED_FIRESTORE_RESPONSE;
  payload: IFireStoreResponse;
}

export interface ISyncUnsubscribeListenersAction {
  type: typeof SYNC_UNSUBSCRIBE_LISTENERS;
  payload: () => void;
}

export interface IBuildMainStructureMapAction {
  type: typeof BUILD_MAIN_STRUCTURE_MAP;
  payload: ParsedQueries;
}

// export interface IStructuralSearchQuery_ViewOptions {
//   displayType: string;
//   structureBy: string;
// }
