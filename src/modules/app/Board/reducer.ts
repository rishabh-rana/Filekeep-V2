import {
  ISyncUnsubscribeListenersAction,
  IReceivedFirestoreResponseAction,
  ISearchState,
  SYNC_UNSUBSCRIBE_LISTENERS,
  RECIEVED_FIRESTORE_RESPONSE,
  BUILD_MAIN_STRUCTURE_MAP,
  IBuildMainStructureMapAction,
  IFireStoreResponse
} from "./types";
import { buildMapFromParsedQueries } from "./reducer/buildMap";

const initialState: ISearchState = {
  unsubscribeListeners: [],
  mainStructure: {},
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
      const data = action.payload;
      const list = state.mainStructure[data.nodeId];
      let nodes: IFireStoreResponse[] | false = [];
      if (list) nodes = [...list.nodes];
      if (nodes && data.deletionMode !== true) {
        nodes.push(data);
      } else if (nodes && data.deletionMode === true) {
        nodes.forEach((node, i) => {
          if (node.id === data.id) {
            //@ts-ignore
            nodes.splice(i, 1);
            return;
          }
        });
      }
      if (list) {
        return {
          ...state,
          mainStructure: {
            ...state.mainStructure,
            [data.nodeId]: {
              header: list.header,
              nodes
            }
          }
        };
      } else {
        break;
      }

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
