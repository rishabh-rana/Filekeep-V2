import {
  IApplicationState,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE,
  SYNC_ACTIVE_COMPANY,
  ISyncActiveCompanyAction,
  ISyncNameMapAction,
  SYNC_NAMEMAP,
  ISyncSetupCompanyAction,
  SYNC_SETUP_COMPANY
} from "./appTypes";

const initialState: IApplicationState = {
  activeCompany: null,
  private_structure: null,
  tagIdToNameMap: null,
  setupCompany: false
};

const reducer = (
  state = initialState,
  action:
    | ISyncPrivateStructureAction
    | ISyncActiveCompanyAction
    | ISyncNameMapAction
    | ISyncSetupCompanyAction
): IApplicationState => {
  switch (action.type) {
    case SYNC_PRIVATE_STRUCTURE:
      return { ...state, private_structure: action.payload };
    case SYNC_ACTIVE_COMPANY:
      return {
        ...state,
        activeCompany: action.payload === "" ? null : action.payload
      };
    case SYNC_NAMEMAP:
      return { ...state, tagIdToNameMap: action.payload };
    case SYNC_SETUP_COMPANY:
      return { ...state, setupCompany: action.payload };
  }

  return state;
};

export default reducer;
