import { firestore, functions } from "../../../config/firebase";
import { COMPANIES_COLLECTION } from "../../../config/firestoreConstants";

import {
  PUBLIC_STRUCTURE,
  TAGID_TO_TAGNAME_MAP,
  ITagidToTagnameMap,
  IPrivateStructureIndexedDBObject,
  IServerPrivateStructureObject,
  ITagNameToTagidObject,
  TAGNAME_TO_TAGID_MAP
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
      if (!serverData) {
        return;
      }
      const tagidToTagName: ITagidToTagnameMap = {};
      // sync nameMap, currently we are syncing on every snapshot
      if (serverData[TAGNAME_TO_TAGID_MAP]) {
        // sync name map
        addDatabaseStructureData({
          keyPath: TAGNAME_TO_TAGID_MAP,
          data: serverData[TAGNAME_TO_TAGID_MAP]
        });

        Object.keys(serverData[TAGNAME_TO_TAGID_MAP]).forEach(tagName => {
          serverData[TAGNAME_TO_TAGID_MAP][tagName].tagids.forEach(
            (tagid: string) => {
              tagidToTagName[tagid] = tagName;
            }
          );
        });
        addDatabaseStructureData({
          keyPath: TAGID_TO_TAGNAME_MAP,
          data: tagidToTagName as any
        });
        store.dispatch(
          SyncNameMap(tagidToTagName, serverData[TAGNAME_TO_TAGID_MAP])
        );
      }
      // execute sync
      performPublicSync(serverData[PUBLIC_STRUCTURE], tagidToTagName);
    });
  //@ts-ignore
  return unsubscribe;
};

const performPublicSync = async (
  publicStructureFromServer: IServerPrivateStructureObject,
  tagIdToTagNameMap: ITagidToTagnameMap
): Promise<boolean> => {
  // get stored copy of public structure
  let storedPublicStructure = await ((getDatabaseStructure(
    PUBLIC_STRUCTURE
  ) as unknown) as IPrivateStructureIndexedDBObject | false);

  const { copyOfServerData, changeMap } = returnDiffs(
    publicStructureFromServer,
    storedPublicStructure ? storedPublicStructure.data : false,
    tagIdToTagNameMap
  );

  // there were changes, this !== false, in this case, sync public structure in IDB
  if (copyOfServerData) {
    const { activeCompany } = await getVariableServerPaths();

    if (!activeCompany) {
      return false;
    } else {
      try {
        console.log(changeMap);
        const handlePublicShare = await functions.httpsCallable(
          "handlePublicShare"
        )({
          changeMap,
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
  // exit call
  return true;
};
