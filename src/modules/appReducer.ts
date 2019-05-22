import {
  IApplicationState,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE,
  SYNC_ACTIVE_COMPANY,
  ISyncActiveCompanyAction,
  ISyncNameMapAction,
  SYNC_NAMEMAP
} from "./appTypes";

const initialState: IApplicationState = {
  activeCompany: localStorage.getItem("activeCompany"),
  private_structure: null,
  tagIdToNameMap: null
};

const reducer = (
  state = initialState,
  action:
    | ISyncPrivateStructureAction
    | ISyncActiveCompanyAction
    | ISyncNameMapAction
): IApplicationState => {
  switch (action.type) {
    case SYNC_PRIVATE_STRUCTURE:
      return { ...state, private_structure: action.payload };
    case SYNC_ACTIVE_COMPANY:
      return { ...state, activeCompany: action.payload };
    case SYNC_NAMEMAP:
      return { ...state, tagIdToNameMap: action.payload };
  }

  return state;
};

export default reducer;
