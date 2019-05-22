import { ThunkAction } from "redux-thunk";
import { AppState } from "../indexReducer";
import { Action } from "redux";
import { IErrorPopup } from "./errorTypes";
import { throwErrorCreator, resolveErrorCreator } from "./errorActionCreator";

export const throwError = (
  errorObj: IErrorPopup
): ThunkAction<void, AppState, null, Action<string>> => {
  return dispatch => {
    dispatch(throwErrorCreator(errorObj));
  };
};

export const resolveError = (): ThunkAction<
  void,
  AppState,
  null,
  Action<string>
> => {
  return dispatch => {
    dispatch(resolveErrorCreator());
  };
};
