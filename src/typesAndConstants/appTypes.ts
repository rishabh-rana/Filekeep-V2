export const SYNC_ROOT_FUSE_INDICES = "sync_root_fuse_indices";
export const SYNC_SHARED_FUSE_INDICES = "sync_shared_fuse_indices";
export const ROOT_DATABASE_STRUCTURE = "root_structure";
export const SHARED_DATABASE_STRUCTURE = "shared_channels";
export const ROOT_FUSE_INDICES = "root_fuse_indices";
export const SHARED_FUSE_INDICES = "shared_fuse_indices";

export const SYNC_PRIVATE_STRUCTURE = "sync_private_structure";
export const PRIVATE_STRUCTURE = "private_structure";
export const PUBLIC_STRUCTURE = "public_structure";
export const TAGID_TO_TAGNAME_MAP = "tagidToTagnameMap";
export const SYNC_ACTIVE_COMPANY = "sync_active_company";

export interface ISyncActiveCompanyAction {
  type: typeof SYNC_ACTIVE_COMPANY;
  payload: string;
}

export interface ITagidToTagnameMap {
  [tagid: string]: string;
}

export interface ISyncPrivateStructureAction {
  type: typeof SYNC_PRIVATE_STRUCTURE;
  payload: PrivateStructureMap;
}
export interface IRawPrivateStructureObject {
  tag: string;
  parents: string[];
}

export interface IDeletionMap {
  [tag: string]: { parents?: string[]; mainTag?: string };
}

export interface IPrivateStructureObject {
  tag: string;
  parents: string[];
  tagName: string;
}

export interface IPrivateStructureIndexedDBObject {
  keyPath: string;
  data: PrivateStructureMap;
}

export type PrivateStructureMap = Map<string, IPrivateStructureObject>;

export interface IApplicationState {
  activeCompany: string | null;
  private_structure: PrivateStructureMap | null;
}

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
