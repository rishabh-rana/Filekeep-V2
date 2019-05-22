export interface IParsedQueries1 {
  [requestedTag: string]: string[];
}

export interface IParsedQueries {
  [requestedTag: string]: IDestructured;
}

export interface IDestructured {
  [operator: string]: string[];
}
