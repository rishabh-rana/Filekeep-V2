import { firestore, functions } from "../../../config/firebase";
import { COMPANIES_COLLECTION } from "../../../config/firestoreConstants";

import {
  PUBLIC_STRUCTURE,
  TAGID_TO_TAGNAME_MAP,
  IRawPrivateStructureObject,
  ITagidToTagnameMap,
  IPrivateStructureIndexedDBObject
} from "../../../modules/appTypes";
import { returnDiffs } from "./helperFunctions";
import { getVariableServerPaths } from "../../../utils/getVariableServerPaths";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseHeirarchyStructure";
import store from "../../../store";
import { SyncNameMap } from "../../../modules/appActionCreator";

// sync public asets from server to the private structure on the server, state, IDB of current user

export const syncPublicStructure = async (): Promise<() => void> => {
  let unsubscribe: () => void;
  const { activeCompany } = await getVariableServerPaths();

  // no active company
  if (!activeCompany) return () => {};

  unsubscribe = firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .onSnapshot(async doc => {
      const serverData = doc.data();
      console.log("SNAPSHOT RECEIVED FROM PUBLIC");
      if (!serverData) {
        return;
      }
      // sync nameMap
      if (serverData[TAGID_TO_TAGNAME_MAP]) {
        // sync name map
        addDatabaseStructureData({
          keyPath: TAGID_TO_TAGNAME_MAP,
          data: serverData[TAGID_TO_TAGNAME_MAP]
        });
        store.dispatch(SyncNameMap(serverData[TAGID_TO_TAGNAME_MAP]));
      }
      console.log("trying sync public", serverData);
      // execute sync
      performPublicSync(
        serverData[PUBLIC_STRUCTURE],
        serverData[TAGID_TO_TAGNAME_MAP]
      );
    });
  //@ts-ignore
  return unsubscribe;
};

const performPublicSync = async (
  publicStructureFromServer: IRawPrivateStructureObject[],
  tagIdToTagNameMap: ITagidToTagnameMap
): Promise<boolean> => {
  // get stored copy of public structure
  let storedPublicStructure = await ((getDatabaseStructure(
    PUBLIC_STRUCTURE
  ) as unknown) as IPrivateStructureIndexedDBObject | false);

  const { copyOfServerData, deletionMap } = returnDiffs(
    publicStructureFromServer,
    storedPublicStructure ? storedPublicStructure.data : false,
    tagIdToTagNameMap
  );
  console.log(storedPublicStructure);

  // there were changes, this !== false, in this case, sync public structure in IDB
  if (copyOfServerData) {
    const { activeCompany } = await getVariableServerPaths();

    if (!activeCompany) {
      return false;
    } else {
      try {
        const handlePublicShare = await functions.httpsCallable(
          "handlePublicShare"
        )({
          deletionMap,
          activeCompany
        });
        // successfully synced to privateStructure of user
        if (handlePublicShare.data.done) {
          // add the public structure to the IDB
          addDatabaseStructureData({
            keyPath: PUBLIC_STRUCTURE,
            data: copyOfServerData
          });
        }
      } catch (err) {
        // do nothing
        console.log(err.code, err.message);
      }
    }
  }
  console.log("finished sync public");
  // exit call
  return true;
};
