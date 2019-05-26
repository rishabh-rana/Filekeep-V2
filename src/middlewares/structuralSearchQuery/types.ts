export interface IDestructured {
  [operator: string]: string[];
}

export type SemiParsedQueryMap = Map<string, string[]>;

export type ParsedQueryMap = Map<string, IDestructured>;

export interface IAugmentedQuery {
  [operator: string]: string[][];
}

export type AugmentedQueryMap = Map<string, IAugmentedQuery>;
