import { firestore } from "../../config/firebase";
import {
  COMPANIES_COLLECTION,
  MAIN_DATA_SUBCOLLECTION
} from "../../config/firestoreConstants";
import { IParsedQueries } from "./types";

//build the query from the sent options and input
export const buildQueryFromInput = (
  queryArray: IParsedQueries[]
): firebase.firestore.Query[] | false => {
  // replace this with a getState implementation from store
  const activeCompany = localStorage.getItem("activeCompany");

  if (!activeCompany) return false;

  // WE NEED TO ENSURE THAT WE PUT A WHERE CLAUSE FOR ALL CHANNELS SHARED WITH USER
  // eg. if query was client -> and say client exist on frontend and backend
  // and only frontend is shared with me, then i will treat query as client in frontend
  // otherwise we will get permission denied from backend, prepare for this case as well

  // base query
  let queryBase = firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .collection(MAIN_DATA_SUBCOLLECTION);

  //get mutable copy of queries
  var queries = [...queryArray];

  let firestoreQuery: firebase.firestore.Query[] = [];

  // loop over queries array
  queries.forEach(query => {
    // loop over the instruction object, (one only) to get a single key, primetag
    Object.keys(query).map(primetag => {
      // primetag is "Client" in "Client in Frontend"
      // set a mutatable subquery to the base query

      // match for title, heirarchy level one
      let subQuery: firebase.firestore.Query = queryBase.where(
        "tag." + primetag,
        "==",
        1
      );

      if (query[primetag].hasOwnProperty("in")) {
        query[primetag].in.forEach((parentTag, parentIndex) => {
          // match for grandparents and higher as per 'in' information from the queryArray
          subQuery = subQuery.where("tag." + parentTag, "==", 2 + parentIndex);
        });
      }
      // push all queries in one array
      firestoreQuery.push((subQuery as unknown) as firebase.firestore.Query);
    });
  });
  // firestore queryArray is ready

  return firestoreQuery;
};
