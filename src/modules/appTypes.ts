// action names
export const SYNC_PRIVATE_STRUCTURE = "sync_private_structure";
export const SYNC_ACTIVE_COMPANY = "sync_active_company";
export const SYNC_NAMEMAP = "sync_nameMap";
export const SYNC_SETUP_COMPANY = "sync_setupCompany";
// server and IDB constants
export const PRIVATE_STRUCTURE = "private_structure";
export const PUBLIC_STRUCTURE = "public_structure";
export const TAGID_TO_TAGNAME_MAP = "tagidToTagnameMap";

// app state
export interface IApplicationState {
  activeCompany: string | null;
  private_structure: PrivateStructureMap | null;
  tagIdToNameMap: ITagidToTagnameMap | null;
  setupCompany: boolean;
}
// actions
export interface ISyncActiveCompanyAction {
  type: typeof SYNC_ACTIVE_COMPANY;
  payload: string;
}

export interface ISyncNameMapAction {
  type: typeof SYNC_NAMEMAP;
  payload: ITagidToTagnameMap;
}

export interface ISyncPrivateStructureAction {
  type: typeof SYNC_PRIVATE_STRUCTURE;
  payload: PrivateStructureMap;
}

export interface ISyncSetupCompanyAction {
  type: typeof SYNC_SETUP_COMPANY;
  payload: boolean;
}

// Server Object

export interface IServerPrivateStructureObject {
  [tag: string]: IRawPrivateStructureObject;
}

export interface IRawPrivateStructureObject {
  parents: string[];
  children: string[];
  type: string;
  level: number;
}

// App types

export interface IPrivateStructureObject extends IRawPrivateStructureObject {
  tagName: string;
}

export type PrivateStructureMap = Map<string, IPrivateStructureObject>;

export interface IPrivateStructureIndexedDBObject {
  keyPath: string;
  data: PrivateStructureMap;
}

export interface ITagidToTagnameMap {
  [tagid: string]: string;
}

export interface IDeletionMap {
  [tag: string]: { parents?: string[]; mainTag?: string };
}
