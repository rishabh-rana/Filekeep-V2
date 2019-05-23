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
  SYNC_SETUP_COMPANY
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
  nameMap: ITagidToTagnameMap
): ISyncNameMapAction => {
  return {
    type: SYNC_NAMEMAP,
    payload: nameMap
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
