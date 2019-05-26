import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  MAIN_DATA_SUBCOLLECTION
} from "../../../config/firestoreConstants";
import { AugmentedQueryMap } from "../types";
import { augmentQueries } from "./augmentQueries";
import { parseInput } from "./parseInput";

//build the query from the sent options and input
export const buildQueryFromInput = (
  augmentedQueries: AugmentedQueryMap,
  activeCompany: string
): firebase.firestore.Query[] => {
  // WE NEED TO ENSURE THAT WE PUT A WHERE CLAUSE FOR ALL CHANNELS SHARED WITH USER
  // eg. if query was client -> and say client exist on frontend and backend
  // and only frontend is shared with me, then i will treat query as client in frontend
  // otherwise we will get permission denied from backend, prepare for this case as well

  // base query

  const queryBase = `${COMPANIES_COLLECTION}/${activeCompany}/${MAIN_DATA_SUBCOLLECTION}/`;

  let firestoreQueries: firebase.firestore.Query[] = [];

  // loop over queries array
  augmentedQueries.forEach((augmentedQuery, primeTag) => {
    // loop over the instruction object, (one only) to get a single key, primetag

    // primetag is "Client" in "Client in Frontend"
    // set a mutatable subquery to the base query

    augmentedQuery.in.forEach(parentsArray => {
      let queryPathArray: string[] = [];
      let queryArray: string[] = [];
      parentsArray.reverse().forEach(parent => {
        if (queryPathArray.length < 2) {
          queryPathArray.push(parent);
        } else if (queryPathArray.length === 2) {
          queryPathArray.push(parent);
          queryPathArray.push(MAIN_DATA_SUBCOLLECTION);
          queryArray.push(parent);
        } else {
          queryArray.push(parent);
        }
      });
      queryPathArray.push(primeTag);
      queryPathArray.push(MAIN_DATA_SUBCOLLECTION);
      queryArray.push(primeTag);
      const queryPath = queryPathArray.join("/");

      if (queryPathArray.length % 2 === 1) return;

      let firestoreQuery: any = firestore.collection(queryBase + queryPath);
      queryArray.reverse().forEach((tag, i) => {
        firestoreQuery = firestoreQuery.where("tag." + tag, "==", i + 2);
      });

      firestoreQueries.push(firestoreQuery);
    });
  });
  // firestore queryArray is ready
  console.log(firestoreQueries);
  return firestoreQueries;
};
