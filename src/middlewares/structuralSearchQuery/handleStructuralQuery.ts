import { MiddlewareAPI, AnyAction, Dispatch } from "redux";
import { AppState } from "../../modules/indexReducer";
import {
  ISendStructuralSearchQueryAction,
  SEND_STRUCTURAL_SEARCH_QUERY
} from "../../modules/app/buildStructure/types";
import { buildQueryFromInput } from "./helper/buildFireStoreQuery";
import { buildMainStructureMap } from "../../modules/app/buildStructure/actionCreator";
import { executeFirestoreGet } from "./helper/executeFirestoreGet";

export const executeStructuralQuery = (
  api: MiddlewareAPI<Dispatch<AnyAction>, AppState>
) => (next: Dispatch<AnyAction>) => async (
  action: ISendStructuralSearchQueryAction
) => {
  if (!action.payload || action.type !== SEND_STRUCTURAL_SEARCH_QUERY) {
    return next(action);
  }
  const activeCompany = action.payload.activeCompany;
  // // build map
  api.dispatch(buildMainStructureMap(action.payload.parsedQueries));
  const fireStoreQueries = buildQueryFromInput(
    action.payload.parsedQueries,
    activeCompany
  );

  if (fireStoreQueries !== false) {
    executeFirestoreGet(fireStoreQueries.firestoreChannels);
  }
  console.log(fireStoreQueries);

  next(action);
};
