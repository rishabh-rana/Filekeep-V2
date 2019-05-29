import {
  IApplicationState,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE,
  SYNC_ACTIVE_COMPANY,
  ISyncActiveCompanyAction,
  ISyncNameMapAction,
  SYNC_NAMEMAP,
  ISyncSetupCompanyAction,
  SYNC_SETUP_COMPANY,
  SYNC_ACTIVE_COMPANY_FOR_SETUP,
  ISyncActiveCompanyForSetup
} from "./appTypes";

const initialState: IApplicationState = {
  activeCompany: null,
  private_structure: null,
  tagIdToTagNameMap: null,
  tagNameToTagidMap: null,
  activeCompanyForSetup: null,
  setupCompany: localStorage.getItem(
    `settingUp${localStorage.getItem("activeCompany")}`
  )
    ? true
    : false
};

const reducer = (
  state = initialState,
  action:
    | ISyncPrivateStructureAction
    | ISyncActiveCompanyAction
    | ISyncNameMapAction
    | ISyncSetupCompanyAction
    | ISyncActiveCompanyForSetup
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
      return {
        ...state,
        tagNameToTagidMap: action.payload.tagNameToTagidMap,
        tagIdToTagNameMap: action.payload.tagidToTagNameMap
      };
    case SYNC_SETUP_COMPANY:
      return { ...state, setupCompany: action.payload };
    case SYNC_ACTIVE_COMPANY_FOR_SETUP:
      return { ...state, activeCompanyForSetup: action.payload };
  }

  return state;
};

export default reducer;
