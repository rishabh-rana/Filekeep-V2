import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  MAIN_DATA_SUBCOLLECTION
} from "../../../config/firestoreConstants";
import { AugmentedQueryMap } from "../types";
import store from "../../../store";

const getPrivateStructure = () => {
  return store.getState().app.appCore.private_structure;
};

//build the query from the sent options and input
export const buildQueryFromInput = (
  augmentedQueries: AugmentedQueryMap,
  activeCompany: string
): firebase.firestore.Query[] => {
  // WE NEED TO ENSURE THAT WE PUT A WHERE CLAUSE FOR ALL CHANNELS SHARED WITH USER
  // eg. if query was client -> and say client exist on frontend and backend
  // and only frontend is shared with me, then i will treat query as client in frontend
  // otherwise we will get permission denied from backend, prepare for this case as well

  const private_structure = getPrivateStructure();

  if (!private_structure) return [];

  // base query
  const queryBase = `${COMPANIES_COLLECTION}/${activeCompany}/${MAIN_DATA_SUBCOLLECTION}/`;

  let firestoreQueries: firebase.firestore.Query[] = [];

  // loop over queries array
  augmentedQueries.forEach((augmentedQuery, primeTag) => {
    // primetag is "Client" in "Client in Frontend"

    augmentedQuery.in.forEach(parentsArray => {
      let queryPathArray: string[] = [];

      parentsArray.reverse().forEach(parent => {
        queryPathArray.push("project");
        queryPathArray.push(parent);
      });

      const requestedTagDoc = private_structure.get(primeTag);
      if (!requestedTagDoc) return;

      // const type = requestedTagDoc.type === "proj" ? "project" : "channel";

      // queryPathArray.push(type);
      // queryPathArray.push(primeTag);
      // if (type === "channel") queryPathArray.push(MAIN_DATA_SUBCOLLECTION);

      // // slice(1) ensures that we dont take initial "project" entry as its already accounted for in the basestring
      // const queryPath = queryPathArray.slice(1).join("/");

      // let firestoreQuery: any;
      // if (type === "channel") {
      //   firestoreQuery = firestore.collection(queryBase + queryPath);
      // } else {
      //   firestoreQuery = firestore.doc(queryBase + queryPath);
      // }
      // // here we can ordering by timestamp or filters to the query

      // firestoreQueries.push(firestoreQuery);
    });
  });
  // firestore queryArray is ready
  console.log(firestoreQueries);
  return firestoreQueries;
};
