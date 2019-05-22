import {
  ISyncActiveCompanyAction,
  ISyncPrivateStructureAction
} from "./appTypes";
import { ISyncUsersAction } from "./auth/authTypes";
import { IRESOLVE_ERROR_ACTION, ITHROW_ERROR_ACTION } from "./error/errorTypes";
import { ISendStructuralSearchQueryAction } from "./app/search/structuralSearchTypes";

export type AllActionTypes =
  | ISyncActiveCompanyAction
  | ISyncPrivateStructureAction
  | ISyncUsersAction
  | IRESOLVE_ERROR_ACTION
  | ITHROW_ERROR_ACTION
  | ISendStructuralSearchQueryAction;
