// server and IDB constants
export const PRIVATE_STRUCTURE = "private_structure";
export const PUBLIC_STRUCTURE = "public_structure";
export const TAGID_TO_TAGNAME_MAP = "tagidToTagnameMap";

// Server Object

export interface IRawPrivateStructureObject {
  tag: string;
  parents: string[];
}

// App types

export interface IDeletionMap {
  [tag: string]: { parents?: string[]; mainTag?: string };
}

export type RawPrivateStructureMap = {
  [tag: string]: IRawPrivateStructureObject;
};
