import {
  PrivateStructureMap,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE,
  ISyncActiveCompanyAction,
  SYNC_ACTIVE_COMPANY,
  ITagidToTagnameMap,
  ISyncNameMapAction,
  SYNC_NAMEMAP,
  ISyncSetupCompanyAction,
  SYNC_SETUP_COMPANY,
  ITagNameToTagidObject,
  SYNC_ACTIVE_COMPANY_FOR_SETUP,
  ISyncActiveCompanyForSetup
} from "./appTypes";

export const SyncPrivateStructureMap = (
  privateMap: PrivateStructureMap
): ISyncPrivateStructureAction => {
  return {
    type: SYNC_PRIVATE_STRUCTURE,
    payload: privateMap
  };
};

export const SyncActiveCompany = (
  activeCompany: string
): ISyncActiveCompanyAction => {
  return {
    type: SYNC_ACTIVE_COMPANY,
    payload: activeCompany
  };
};

export const SyncNameMap = (
  tagidToTagNameMap: ITagidToTagnameMap,
  tagNameToTagidMap: ITagNameToTagidObject
): ISyncNameMapAction => {
  return {
    type: SYNC_NAMEMAP,
    payload: { tagNameToTagidMap, tagidToTagNameMap }
  };
};

export const SyncSetupCompany = (
  shouldSetup: boolean
): ISyncSetupCompanyAction => {
  return {
    type: SYNC_SETUP_COMPANY,
    payload: shouldSetup
  };
};

export const SyncActiveCompanyForSetup = (
  activeCompany: string
): ISyncActiveCompanyForSetup => {
  return {
    type: SYNC_ACTIVE_COMPANY_FOR_SETUP,
    payload: activeCompany
  };
};
