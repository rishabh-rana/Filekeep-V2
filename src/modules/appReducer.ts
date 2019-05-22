import {
  IApplicationState,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE
} from "../typesAndConstants/appTypes";

const initialState: IApplicationState = {
  activeCompany: localStorage.getItem("activeCompany"),
  private_structure: null
};

const reducer = (
  state = initialState,
  action: ISyncPrivateStructureAction
): IApplicationState => {
  switch (action.type) {
    case SYNC_PRIVATE_STRUCTURE:
      return { ...state, private_structure: action.payload };
  }

  return state;
};

export default reducer;
