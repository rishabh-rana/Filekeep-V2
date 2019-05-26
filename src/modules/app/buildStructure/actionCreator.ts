import {
  SEND_STRUCTURAL_SEARCH_QUERY,
  ISendStructuralSearchQueryAction,
  IStructuralSearchQueryData,
  IReceivedFirestoreResponseAction,
  IFireStoreResponse,
  RECIEVED_FIRESTORE_RESPONSE,
  SYNC_UNSUBSCRIBE_LISTENERS,
  ISyncUnsubscribeListenersAction
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

// export const syncUnsubscribeListenersCreator = (
//   unsubscribe: () => void
// ): ISyncUnsubscribeListeners => {
//   return {
//     type: SYNC_UNSUBSCRIBE_LISTENERS,
//     payload: unsubscribe
//   };
// };
