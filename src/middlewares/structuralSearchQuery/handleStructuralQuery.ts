import { MiddlewareAPI, AnyAction, Dispatch } from "redux";
import { AppState } from "../../modules/indexReducer";
import {
  ISendStructuralSearchQueryAction,
  SEND_STRUCTURAL_SEARCH_QUERY
} from "../../modules/app/buildStructure/types";
import { augmentQueries } from "./helper/augmentQueries";
import { parseInput } from "./helper/parseInput";
import { buildQueryFromInput } from "./helper/buildFireStoreQuery";

export const executeStructuralQuery = (
  api: MiddlewareAPI<Dispatch<AnyAction>, AppState>
) => (next: Dispatch<AnyAction>) => async (
  action: ISendStructuralSearchQueryAction
) => {
  if (!action.payload || action.type !== SEND_STRUCTURAL_SEARCH_QUERY) {
    return next(action);
  }
  // const activeCompany = action.payload.activeCompany;
  // const parsedInput = parseInput(action.payload.inputParser);
  // // build map
  // // api.dispatch(buildMainStructureMap(parsedInput));
  // const augmentedQueries = augmentQueries(parsedInput, activeCompany);
  // const fireStoreQueries = buildQueryFromInput(augmentedQueries, activeCompany);

  // //   executeFirestoreGet(fireStoreQueries);
  // console.log(fireStoreQueries);

  next(action);
};
