import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  USERS_SUBCOLLECTION
} from "../../../config/firestoreConstants";

import {
  PUBLIC_STRUCTURE,
  TAGID_TO_TAGNAME_MAP,
  IRawPrivateStructureObject,
  ITagidToTagnameMap,
  IPrivateStructureIndexedDBObject,
  PrivateStructureMap,
  IDeletionMap,
  PRIVATE_STRUCTURE,
  IPrivateStructureObject
} from "../../../modules/appTypes";
import { returnDiffs } from "./helperFunctions";
import { getVariableServerPaths } from "../../../utils/getVariableServerPaths";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseHeirarchyStructure";
import store from "../../../store";
import {
  SyncPrivateStructureMap,
  SyncNameMap
} from "../../../modules/appActionCreator";

// sync public asets from server to the private structure on the server, state, IDB of current user

export const syncPublicStructure = async (): Promise<boolean> => {
  const { activeCompany } = await getVariableServerPaths();

  // no active company
  if (!activeCompany) return false;

  firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .onSnapshot(async doc => {
      const serverData = doc.data();

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
      // execute sync
      const success = await performPublicSync(
        serverData[PUBLIC_STRUCTURE],
        serverData[TAGID_TO_TAGNAME_MAP]
      );
    });

  return true;
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
  // there were changes, this !== false, in this case, sync public structure in IDB
  if (copyOfServerData) {
    addDatabaseStructureData({
      keyPath: PUBLIC_STRUCTURE,
      data: copyOfServerData
    });
  }

  // now we need to union this PublicMap with our private structure, if there were any changes detected to the public structure
  if (copyOfServerData) {
    // get private structure from state, as the syncPrivateStructure() executes before this function call, we get an updated private structure from this call
    const privateStructure = getPrivateStructureFromState();

    if (!privateStructure) {
      // serious error, as there must be a private structure always
      return true;
    }

    // this will denote the final union map
    let finalStructure: PrivateStructureMap = new Map();

    const privateStructureIterator = privateStructure.entries();
    let currentPrivateObject = privateStructureIterator.next();
    // this code makes copy of privateStructure as the Map from redux store is immutable
    while (!currentPrivateObject.done) {
      // handle deletion
      if (
        deletionMap &&
        deletionMap[currentPrivateObject.value[0]] &&
        deletionMap[currentPrivateObject.value[0]].mainTag
      ) {
        // do nothing, as in do not copy this tag as it has been deleted
      } else {
        const obj = currentPrivateObject.value[1];
        finalStructure.set(obj.tag, {
          tag: obj.tag,
          tagName: obj.tagName,
          parents: [...obj.parents]
        });
      }

      currentPrivateObject = privateStructureIterator.next();
    }
    // copies the priateStructure to finalStructure variable, that is made a mutable copy

    // take union
    const iterator = copyOfServerData.values();
    let currentIterator = iterator.next();

    while (!currentIterator.done) {
      const { tag } = currentIterator.value;
      if (finalStructure.has(tag)) {
        // we need to take union now
        const serverParents = currentIterator.value.parents;
        //@ts-ignore
        const localParents = (finalStructure.get(tag)
          .parents as unknown) as string[];
        const helper: any = {};
        [...serverParents, ...localParents].forEach(tag => {
          helper[tag] = true;
        });

        if (deletionMap[tag] && deletionMap[tag].parents) {
          //@ts-ignore
          deletionMap[tag].parents.forEach(deleteTag => {
            delete helper[deleteTag];
          });
        }

        finalStructure.set(tag, {
          tag,
          tagName: currentIterator.value.tagName,
          parents: Object.keys(helper)
        });
      } else {
        // this is a new entry, add directly
        finalStructure.set(tag, currentIterator.value);
      }
      currentIterator = iterator.next();
    }

    // now finalStructure represents union of Public Structure and Private Structure, both synced realtime to server!
    // set this to state, and cache in IDB
    store.dispatch(SyncPrivateStructureMap(finalStructure));
    addDatabaseStructureData({
      keyPath: PRIVATE_STRUCTURE,
      data: finalStructure
    });
    // syncWithFireStore(finalStructure);
  }
  // exit call
  return true;
};

const getPrivateStructureFromState = (): PrivateStructureMap | null => {
  return store.getState().app.private_structure;
};

const syncWithFireStore = async (
  finalStructure: PrivateStructureMap
): Promise<void> => {
  const { activeCompany, uid } = await getVariableServerPaths();
  if (activeCompany && uid) {
    //  sync to server
    const arrayForServer: IRawPrivateStructureObject[] = [];
    const iterator = finalStructure.values();
    let currentIterator = iterator.next();

    while (!currentIterator.done) {
      arrayForServer.push({
        tag: currentIterator.value.tag,
        parents: currentIterator.value.parents
      });
      currentIterator = iterator.next();
    }

    // now send arrayForServer to the user's doc in the company using cloud function endpoint
  }
};
