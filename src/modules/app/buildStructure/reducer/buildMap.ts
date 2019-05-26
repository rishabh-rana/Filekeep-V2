import { ParsedQueryMap } from "../../../../middlewares/structuralSearchQuery/types";
import { MainStructureMap } from "../types";

export const buildMapFromParsedQueries = (
  parsedQueries: ParsedQueryMap
): MainStructureMap => {
  const mainStructure: MainStructureMap = new Map();
  parsedQueries.forEach(primeTag => {});

  return mainStructure;
};
