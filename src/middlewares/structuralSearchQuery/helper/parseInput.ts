import { queryFunctions } from "../../../appData/queryFunctions";
import { IDestructured, SemiParsedQueryMap, ParsedQueryMap } from "../types";

const parseInputToMap = (
  inputParserFromAction: string[]
): SemiParsedQueryMap => {
  const inputParser = [...inputParserFromAction];
  const queries: SemiParsedQueryMap = new Map();

  let queryHelper: string[] = [];
  inputParser.forEach(word => {
    // check if word is "and"
    if (word !== "and") {
      // if not, add it to query helper
      queryHelper.push(word);
    } else {
      // if yes, add a query
      // [Client, ["in", "frontend"]] => this is the parsed input for "Client in Frontend"
      queries.set(queryHelper[0], queryHelper.slice(1));
      // clear helper
      queryHelper = [];
    }
  });
  // add the last query also to the main query list
  queries.set(queryHelper[0], queryHelper.slice(1));

  return queries;
};

const destructureQueryMap = (queries: SemiParsedQueryMap): ParsedQueryMap => {
  const parsedQueries: ParsedQueryMap = new Map();

  queries.forEach((rawQuery, primeTag) => {
    const deStructure: IDestructured = {};
    rawQuery.forEach((word, index) => {
      if (queryFunctions.indexOf(word) !== -1) {
        deStructure[word] =
          deStructure[word] !== undefined
            ? [...deStructure[word], rawQuery[index + 1]]
            : [rawQuery[index + 1]];
      }
    });
    parsedQueries.set(primeTag, deStructure);
  });

  return parsedQueries;
};

export const parseInput = (inputParser: string[]): ParsedQueryMap => {
  return destructureQueryMap(parseInputToMap(inputParser));
};
