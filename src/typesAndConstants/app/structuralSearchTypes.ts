export const SEND_STRUCTURAL_SEARCH_QUERY = "sendStructuralSearchQuery";

export interface IStructuralSearchQueryData {
  inputParser: string[];
  viewOptions: IStructuralSearchQuery_ViewOptions;
}

export interface ISendStructuralSearchQueryAction {
  type: typeof SEND_STRUCTURAL_SEARCH_QUERY;
  payload: IStructuralSearchQueryData;
}

export interface IStructuralSearchQuery_ViewOptions {
  displayType: string;
  structureBy: string;
}
