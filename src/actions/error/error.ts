import { ThunkAction } from "redux-thunk";
import { AppState } from "../../reducers/index";
import { Action } from "redux";
import { IErrorPopup } from "../../types/store/error";
import { throwErrorCreator, resolveErrorCreator } from "./actionCreator";

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
