import {
  SEND_STRUCTURAL_SEARCH_QUERY,
  ISendStructuralSearchQueryAction,
  IStructuralSearchQueryData,
  IReceivedFirestoreResponseAction,
  RECIEVED_FIRESTORE_RESPONSE,
  SYNC_UNSUBSCRIBE_LISTENERS,
  ISyncUnsubscribeListenersAction,
  IBuildMainStructureMapAction,
  BUILD_MAIN_STRUCTURE_MAP,
  ParsedQueries,
  IFireStoreResponse
} from "./types";

export const sendStructuralSearchQueryCreator = (
  queryData: IStructuralSearchQueryData
): ISendStructuralSearchQueryAction => {
  return {
    type: SEND_STRUCTURAL_SEARCH_QUERY,
    payload: queryData
  };
};

export const receivedFirestoreResponseCreator = (
  response: IFireStoreResponse
): IReceivedFirestoreResponseAction => {
  return {
    type: RECIEVED_FIRESTORE_RESPONSE,
    payload: response
  };
};

export const syncUnsubscribeListenersCreator = (
  unsubscribe: () => void
): ISyncUnsubscribeListenersAction => {
  return {
    type: SYNC_UNSUBSCRIBE_LISTENERS,
    payload: unsubscribe
  };
};

export const buildMainStructureMap = (
  parsedQueries: ParsedQueries
): IBuildMainStructureMapAction => {
  return {
    type: BUILD_MAIN_STRUCTURE_MAP,
    payload: parsedQueries
  };
};
