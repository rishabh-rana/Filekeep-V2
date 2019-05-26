import { MiddlewareAPI, AnyAction, Dispatch } from "redux";
import { AppState } from "../../modules/indexReducer";
import {
  ISendStructuralSearchQueryAction,
  SEND_STRUCTURAL_SEARCH_QUERY,
  IReceivedFirestoreResponseAction,
  RECIEVED_FIRESTORE_RESPONSE
} from "../../modules/app/search/structuralSearchTypes";
import { augmentQueries } from "./helper/augmentQueries";
import { parseInput } from "./helper/parseInput";
import { buildQueryFromInput } from "./helper/buildFireStoreQuery";
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
  const augmentedQueries = augmentQueries(
    parseInput(action.payload.inputParser),
    activeCompany
  );
  const fireStoreQueries = buildQueryFromInput(augmentedQueries, activeCompany);

  //   executeFirestoreGet(fireStoreQueries);
  console.log(fireStoreQueries);

  next(action);
};

// export const handleFirestoreGetResponse = (
//   api: MiddlewareAPI<Dispatch<AnyAction>, AppState>
// ) => (next: Dispatch<AnyAction>) => (
//   action: IReceivedFirestoreResponseAction
// ) => {
//   if (!action.payload || action.type !== RECIEVED_FIRESTORE_RESPONSE) {
//     return next(action);
//   }

//   next(action);
// };
