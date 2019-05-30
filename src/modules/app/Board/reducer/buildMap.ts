import { MainStructureMap, ParsedQueries } from "../../Board/types";

export const buildMapFromParsedQueries = (
  parsedQueries: ParsedQueries
): MainStructureMap => {
  const mainStructure: MainStructureMap = {};
  parsedQueries.forEach(query => {
    query.tagids.forEach(queryNode => {
      if (query.type === "c") {
        mainStructure[queryNode] = {
          header: "Trial Header",
          nodes: []
        };
      } else {
        mainStructure[queryNode] = {
          header: "Summary Node",
          nodes: []
        };
      }
    });
  });

  return mainStructure;
};
