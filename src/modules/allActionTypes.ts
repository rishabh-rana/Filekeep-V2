import { ISyncFuseIndicesAction } from "../typesAndConstants/appTypes";
import { ISyncUsersAction } from "../typesAndConstants/authTypes";
import {
  IRESOLVE_ERROR_ACTION,
  ITHROW_ERROR_ACTION
} from "../typesAndConstants/errorTypes";
import { ISendStructuralSearchQueryAction } from "../typesAndConstants/app/structuralSearchTypes";

export type AllActionTypes =
  | ISyncFuseIndicesAction
  | ISyncUsersAction
  | IRESOLVE_ERROR_ACTION
  | ITHROW_ERROR_ACTION
  | ISendStructuralSearchQueryAction;
