// server and IDB constants
export const PRIVATE_STRUCTURE = "private_structure";
export const PUBLIC_STRUCTURE = "public_structure";
export const TAGID_TO_TAGNAME_MAP = "tagidToTagnameMap";

// Server Object

export interface IServerPrivateStructureObject {
  [tag: string]: IRawPrivateStructureObject;
}

export interface IRawPrivateStructureObject {
  parents: IParentObject;
  type: string;
  level: number;
}

// App types

export interface IParentObject {
  [tagid: string]: true;
}

export interface IDeletionMap {
  [tag: string]: { parents?: IParentObject; mainTag?: string };
}
