import {
  SEND_STRUCTURAL_SEARCH_QUERY,
  ISendStructuralSearchQueryAction,
  IStructuralSearchQueryData
} from "../../../typesAndConstants/app/structuralSearchTypes";

export const sendStructuralSearchQueryCreator = (
  queryData: IStructuralSearchQueryData
): ISendStructuralSearchQueryAction => {
  return {
    type: SEND_STRUCTURAL_SEARCH_QUERY,
    payload: queryData
  };
};