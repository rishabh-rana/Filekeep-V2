interface IFuseIndicesParentFieldStructure {
  [key: string]: boolean;
}

export interface IFuseIndex {
  tag: string;
  parents?: IFuseIndicesParentFieldStructure;
}
