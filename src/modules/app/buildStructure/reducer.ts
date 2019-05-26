import {
  ISyncUnsubscribeListenersAction,
  IReceivedFirestoreResponseAction,
  ISearchState,
  SYNC_UNSUBSCRIBE_LISTENERS,
  RECIEVED_FIRESTORE_RESPONSE
} from "./types";

const initialState: ISearchState = {
  unsubscribeListeners: [],
  primeStructure: new Map()
};

const reducer = (
  state = initialState,
  action: ISyncUnsubscribeListenersAction | IReceivedFirestoreResponseAction
): ISearchState => {
  switch (action.type) {
    case SYNC_UNSUBSCRIBE_LISTENERS:
      return {
        ...state,
        unsubscribeListeners: [...state.unsubscribeListeners, action.payload]
      };
    case RECIEVED_FIRESTORE_RESPONSE:
      console.log(action.payload);
      return { ...state };
  }

  return state;
};

export default reducer;
