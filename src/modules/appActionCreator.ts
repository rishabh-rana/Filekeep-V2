import {
  IFuseIndex,
  ISyncFuseIndicesAction,
  SYNC_ROOT_FUSE_INDICES,
  SYNC_SHARED_FUSE_INDICES,
  PrivateStructureMap,
  ISyncPrivateStructureAction,
  SYNC_PRIVATE_STRUCTURE,
  ISyncActiveCompanyAction,
  SYNC_ACTIVE_COMPANY
} from "../typesAndConstants/appTypes";

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

export function SyncRootFuseIndicesCreator(
  rootFuseIndices: IFuseIndex[]
): ISyncFuseIndicesAction {
  return {
    type: SYNC_ROOT_FUSE_INDICES,
    payload: rootFuseIndices
  };
}

export function SyncSharedFuseIndicesCreator(
  sharedFuseIndices: IFuseIndex[]
): ISyncFuseIndicesAction {
  return {
    type: SYNC_SHARED_FUSE_INDICES,
    payload: sharedFuseIndices
  };
}
