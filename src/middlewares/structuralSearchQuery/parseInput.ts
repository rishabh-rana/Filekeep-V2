import { queryFunctions } from "../../appData/queryFunctions";
import { IDestructured, IParsedQueries, IParsedQueries1 } from "./types";

const parseInputToMap = (
  inputParserFromAction: string[]
): IParsedQueries1[] => {
  const inputParser = [...inputParserFromAction];
  const queries: IParsedQueries1[] = [];

  let queryHelper: string[] = [];
  inputParser.forEach(word => {
    // check if word is "and"
    if (word !== "and") {
      // if not, add it to query helper
      queryHelper.push(word);
    } else {
      // if yes, add a query
      // [{Client: ["in", "frontend"]}] => this is the parsed input for "Client in Frontend"
      queries.push({
        [queryHelper[0]]: queryHelper.slice(1)
      });
      // clear helper
      queryHelper = [];
    }
  });
  // add the last query also to the main query list
  queries.push({
    [queryHelper[0]]: queryHelper.slice(1)
  });

  return queries;
};

const destructureQueryMap = (queries: any[]): IParsedQueries[] => {
  queries.forEach(query => {
    // loop over each object aka one object only, to get its key
    Object.keys(query).map(primeTag => {
      // prime tag is the tag that we need to retrieve, rest all are
      // options for the instruction
      var deStructure: IDestructured = {};
      // get each instruction, word by word
      query[primeTag].forEach((word: string, index: number) => {
        // check if the word is a recognized command or a tag
        if (queryFunctions.indexOf(word) !== -1) {
          // if a recognized command, add options to the instruction under that command
          deStructure[word] = deStructure.hasOwnProperty(word)
            ? [...deStructure[word], query[primeTag][index + 1]]
            : [query[primeTag][index + 1]];
          // for "Client in Frontend in Design" => Client is primeTag, destructure=> {"in" : ["Frontend", "Design"]}
        }
      });
      query[primeTag] = deStructure;
      // query becomes: {"Client": {"in" : ["Frontend", "Backend"]}}
    });
  });

  return queries;
};

export const parseInput = (inputParser: string[]): IParsedQueries[] => {
  return destructureQueryMap(parseInputToMap(inputParser));
};
