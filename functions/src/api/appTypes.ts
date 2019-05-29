// server and IDB constants
export const PRIVATE_STRUCTURE = "private_structure";
export const PUBLIC_STRUCTURE = "public_structure";
export const TAGID_TO_TAGNAME_MAP = "tagidToTagnameMap";

// Server Object

export interface IServerPrivateStructureObject {
  [tag: string]: string;
}

// App types

export interface IChangeMap {
  deletions: string[];
  insertions: IServerPrivateStructureObject;
}
