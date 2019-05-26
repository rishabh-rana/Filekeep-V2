import {
  THROW_ERROR,
  RESOLVE_ERROR,
  IErrorPopup,
  ITHROW_ERROR_ACTION,
  IRESOLVE_ERROR_ACTION
} from "./types";

export function throwErrorCreator(errorObj: IErrorPopup): ITHROW_ERROR_ACTION {
  return {
    type: THROW_ERROR,
    payload: errorObj
  };
}

export function resolveErrorCreator(): IRESOLVE_ERROR_ACTION {
  return {
    type: RESOLVE_ERROR,
    payload: null
  };
}
