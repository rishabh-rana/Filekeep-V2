import {
  ISyncUnsubscribeListenersAction,
  IReceivedFirestoreResponseAction,
  ISearchState,
  SYNC_UNSUBSCRIBE_LISTENERS,
  RECIEVED_FIRESTORE_RESPONSE,
  BUILD_MAIN_STRUCTURE_MAP,
  IBuildMainStructureMapAction
} from "./types";
import { buildMapFromParsedQueries } from "./reducer/buildMap";

const initialState: ISearchState = {
  unsubscribeListeners: [],
  mainStructure: new Map(),
  mainDataStore: {}
};

const reducer = (
  state = initialState,
  action:
    | ISyncUnsubscribeListenersAction
    | IReceivedFirestoreResponseAction
    | IBuildMainStructureMapAction
): ISearchState => {
  switch (action.type) {
    case SYNC_UNSUBSCRIBE_LISTENERS:
      return {
        ...state,
        unsubscribeListeners: [...state.unsubscribeListeners, action.payload]
      };
    case RECIEVED_FIRESTORE_RESPONSE:
      console.log(action.payload);
      return {
        ...state,
        mainDataStore: { ...state.mainDataStore, ...action.payload }
      };
    case BUILD_MAIN_STRUCTURE_MAP:
      // call a functoin to build map
      return {
        ...state,
        mainStructure: buildMapFromParsedQueries(action.payload)
      };
  }

  return state;
};

export default reducer;
