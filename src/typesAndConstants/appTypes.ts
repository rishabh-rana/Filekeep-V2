export const SYNC_ROOT_FUSE_INDICES = "sync_root_fuse_indices";
export const ROOT_DATABASE_STRUCTURE = "root_structure";
export const ROOT_FUSE_INDICES = "root_fuse_indices";

interface IFuseIndicesParentFieldStructure {
  [key: string]: boolean;
}

export interface IFuseIndex {
  tag: string;
  parents: IFuseIndicesParentFieldStructure;
}

export interface IAppState {
  root_fuse_indices: IFuseIndex[] | false;
  activeCompany: string | null;
}

export interface ISyncFuseIndicesAction {
  type: typeof SYNC_ROOT_FUSE_INDICES;
  payload: IFuseIndex[];
}

export interface IRootDatabaseStructure_SERVER {
  [key: string]: string[];
}

export interface IRootDatabaseStructure_INDEXEDDB {
  keyPath: string;
  data: IRootDatabaseStructure_SERVER;
}

export interface IRootFuseIndices_INDEXEDDB {
  keyPath: string;
  data: IFuseIndex[];
}
