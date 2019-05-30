import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  MAIN_DATA_SUBCOLLECTION
} from "../../../config/firestoreConstants";
import store from "../../../store";
import { ParsedQueries } from "../../../modules/app/Board/types";

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
