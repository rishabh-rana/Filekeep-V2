import {
  IFuseIndex,
  ISyncFuseIndicesAction,
  SYNC_ROOT_FUSE_INDICES
} from "../typesAndConstants/appTypes";

export function SyncRootFuseIndicesCreator(
  rootFuseIndices: IFuseIndex[]
): ISyncFuseIndicesAction {
  return {
    type: SYNC_ROOT_FUSE_INDICES,
    payload: rootFuseIndices
  };
}
