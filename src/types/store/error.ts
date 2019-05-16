import { colors } from "../../palette/colors";

export const THROW_ERROR = "throwerror";
export const RESOLVE_ERROR = "resolveerror";

export interface IErrorPopup {
  message?: string;
  color?: colors;
  duration?: number;
  clickAction?(): void;
}

export interface IErrorState {
  error: boolean;
  data: IErrorPopup;
}

export interface ITHROW_ERROR_ACTION {
  type: typeof THROW_ERROR;
  payload: IErrorPopup;
}

export interface IRESOLVE_ERROR_ACTION {
  type: typeof RESOLVE_ERROR;
  payload: null;
}
