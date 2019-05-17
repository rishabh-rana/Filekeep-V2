export const SYNC_ROOT_FUSE_INDICES = "sync_root_fuse_indices";
export const SYNC_SHARED_FUSE_INDICES = "sync_shared_fuse_indices";
export const ROOT_DATABASE_STRUCTURE = "root_structure";
export const SHARED_DATABASE_STRUCTURE = "shared_channels";
export const ROOT_FUSE_INDICES = "root_fuse_indices";
export const SHARED_FUSE_INDICES = "shared_fuse_indices";

interface IFuseIndicesParentFieldStructure {
  [key: string]: boolean;
}

export interface IFuseIndex {
  tag: string;
  parents: IFuseIndicesParentFieldStructure;
}

export interface IAppState {
  root_fuse_indices: IFuseIndex[] | false;
  shared_fuse_indices: IFuseIndex[] | false;
  activeCompany: string | null;
}

export interface ISyncFuseIndicesAction {
  type: typeof SYNC_ROOT_FUSE_INDICES | typeof SYNC_SHARED_FUSE_INDICES;
  payload: IFuseIndex[];
}

export interface IDatabaseStructure_SERVER {
  [key: string]: string[];
}

export interface IDatabaseStructure_INDEXEDDB {
  keyPath: string;
  data: IDatabaseStructure_SERVER;
}

export interface IFuseIndices_INDEXEDDB {
  keyPath: string;
  data: IFuseIndex[];
}
