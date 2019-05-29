import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  MAIN_DATA_SUBCOLLECTION
} from "../../../config/firestoreConstants";
import store from "../../../store";
import { ParsedQueries } from "../../../modules/app/buildStructure/types";

const getPrivateStructure = () => {
  return store.getState().app.appCore.private_structure;
};

//build the query from the sent options and input
export const buildQueryFromInput = (
  parsedQueries: ParsedQueries,
  activeCompany: string
):
  | false
  | {
      firestoreProjects: firebase.firestore.DocumentReference[];
      firestoreChannels: firebase.firestore.CollectionReference[];
    } => {
  // WE NEED TO ENSURE THAT WE PUT A WHERE CLAUSE FOR ALL CHANNELS SHARED WITH USER
  // eg. if query was client -> and say client exist on frontend and backend
  // and only frontend is shared with me, then i will treat query as client in frontend
  // otherwise we will get permission denied from backend, prepare for this case as well

  const private_structure = getPrivateStructure();

  if (!private_structure) return false;

  // base query
  const queryBase = `${COMPANIES_COLLECTION}/${activeCompany}/${MAIN_DATA_SUBCOLLECTION}/`;

  const firestoreChannels: firebase.firestore.CollectionReference[] = [];
  const firestoreProjects: firebase.firestore.DocumentReference[] = [];

  parsedQueries.forEach(query => {
    query.tagids.forEach(queryNode => {
      if (query.type === "c") {
        firestoreChannels.push(
          firestore.collection(
            queryBase + queryNode + "/" + MAIN_DATA_SUBCOLLECTION
          )
        );
      } else {
        firestoreProjects.push(firestore.doc(queryBase + queryNode));
      }
    });
  });

  // firestore queryArray is ready
  console.log(firestoreChannels, firestoreProjects);
  return { firestoreChannels, firestoreProjects };
};
