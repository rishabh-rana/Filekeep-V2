import {
  PrivateStructureMap,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE,
  ISyncActiveCompanyAction,
  SYNC_ACTIVE_COMPANY
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
