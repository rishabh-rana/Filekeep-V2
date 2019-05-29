// action names
export const SYNC_PRIVATE_STRUCTURE = "sync_private_structure";
export const SYNC_ACTIVE_COMPANY = "sync_active_company";
export const SYNC_NAMEMAP = "sync_nameMap";
export const SYNC_SETUP_COMPANY = "sync_setupCompany";
export const SYNC_ACTIVE_COMPANY_FOR_SETUP = "sync_setupCompany_forsetuponly";
// server and IDB constants
export const PRIVATE_STRUCTURE = "private_structure";
export const PUBLIC_STRUCTURE = "public_structure";
export const TAGNAME_TO_TAGID_MAP = "tagNameToTagIdMap";
export const TAGID_TO_TAGNAME_MAP = "tagidToTagNameMap";

// app state
export interface IApplicationState {
  activeCompany: string | null;
  private_structure: PrivateStructureMap | null;
  tagIdToTagNameMap: ITagidToTagnameMap | null;
  tagNameToTagidMap: ITagNameToTagidObject | null;
  activeCompanyForSetup: string | null;
  setupCompany: boolean;
}
// actions
export interface ISyncActiveCompanyAction {
  type: typeof SYNC_ACTIVE_COMPANY;
  payload: string;
}

export interface ISyncNameMapAction {
  type: typeof SYNC_NAMEMAP;
  payload: {
    tagidToTagNameMap: ITagidToTagnameMap;
    tagNameToTagidMap: ITagNameToTagidObject;
  };
}

export interface ISyncPrivateStructureAction {
  type: typeof SYNC_PRIVATE_STRUCTURE;
  payload: PrivateStructureMap;
}

export interface ISyncSetupCompanyAction {
  type: typeof SYNC_SETUP_COMPANY;
  payload: boolean;
}

export interface ISyncActiveCompanyForSetup {
  type: typeof SYNC_ACTIVE_COMPANY_FOR_SETUP;
  payload: string;
}

// Server Object

export interface IServerPrivateStructureObject {
  [tag: string]: string;
}

// App types

export interface IPrivateStructureObject {
  tagName: string;
  parent: string;
}

export type PrivateStructureMap = Map<string, IPrivateStructureObject>;

export interface IPrivateStructureIndexedDBObject {
  keyPath: string;
  data: PrivateStructureMap;
}

export interface ITagNameToTagidMapIndexedDbObject {
  keyPath: string;
  data: ITagNameToTagidObject;
}

export interface ITagidToTagnameMapIndexedDBObject {
  keyPath: string;
  data: ITagidToTagnameMap;
}

export interface ITagidToTagnameMap {
  [tagid: string]: string;
}

export interface ITagNameToTagidObject {
  [tagName: string]: {
    tagids: string[];
    type: "p" | "c";
  };
}

export interface IChangeMap {
  deletions: string[];
  insertions: IServerPrivateStructureObject;
}
