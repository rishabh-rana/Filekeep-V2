import { sendStructuralSearchQueryCreator } from "./structuralSearchActionCreator";
import { ThunkAction } from "redux-thunk";
import { AppState } from "../../indexReducer";
import { Action } from "redux";
import { IStructuralSearchQueryData } from "./structuralSearchTypes";

export const sendStructuralSearchQuery = (
  queryData: IStructuralSearchQueryData
): ThunkAction<void, AppState, null, Action<string>> => {
  return dispatch => {
    dispatch(sendStructuralSearchQueryCreator(queryData));
  };
};
