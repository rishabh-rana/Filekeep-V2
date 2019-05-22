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
