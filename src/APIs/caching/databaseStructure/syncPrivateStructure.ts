import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  USERS_SUBCOLLECTION
} from "../../../typesAndConstants/firestoreConstants";
import { getVariableServerPaths } from "../../../utils/getVariableServerPaths";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseHeirarchyStructure";
import {
  PRIVATE_STRUCTURE,
  IPrivateStructureIndexedDBObject,
  TAGID_TO_TAGNAME_MAP,
  ITagidToTagnameMap,
  IPrivateStructureObject,
  IRawPrivateStructureObject,
  PrivateStructureMap,
  PUBLIC_STRUCTURE,
  IDeletionMap
} from "../../../typesAndConstants/appTypes";
import { returnDiffs } from "./helperFunctions";
import store from "../../../store";
import { SyncPrivateStructureMap } from "../../../modules/appActionCreator";

// this method syncs in realtime, the private assets on this company container shared with current user

export const syncPrivateStructure = (): Promise<true> => {
  // return a promise to invoke next caching methof after this has completed
  const promise: Promise<true> = new Promise(async (resolve, reject) => {
    // this method will resolve only once, not on every realtime update
    let resolveOnce = () => {
      resolveOnce = () => {};
      resolve(true);
    };
    // get activeCompany and uid from redux
    const { activeCompany, uid } = await getVariableServerPaths();
    // if no data, it may be an error or the user may be offline and have deleted local storage
    // we will still sync data from indexedDb to state from another method
    if (!activeCompany || !uid) {
      resolveOnce();
      return;
    }
    // set up realtime listener
    firestore
      .collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .collection(USERS_SUBCOLLECTION)
      .doc(uid)
      .onSnapshot(async doc => {
        const serverData = doc.data();

        if (!serverData) {
          resolveOnce();
          return;
        }
        // if no private_strucutre field exist on the data from server
        // it implies it is a fresh creation
        // we just sync all public assets of company with the new signup
        if (!serverData[PRIVATE_STRUCTURE]) {
          // get public assets
          const doc = await firestore
            .collection(COMPANIES_COLLECTION)
            .doc(activeCompany)
            .get();
          const data = doc.data();

          if (!data || !data[PUBLIC_STRUCTURE]) {
            // this means some serious error or misconfiguration occured
            resolveOnce();
            return;
          }
          // update the private asets
          firestore
            .collection(COMPANIES_COLLECTION)
            .doc(activeCompany)
            .collection(USERS_SUBCOLLECTION)
            .doc(uid)
            .update({
              [PRIVATE_STRUCTURE]: data[PUBLIC_STRUCTURE]
            });

          resolveOnce();
          return;
        }
        // successfully got serverData
        const done = await syncOperation(serverData[PRIVATE_STRUCTURE]);
        resolveOnce();
      });
  });

  return promise;
};

const syncOperation = async (
  serverData: IRawPrivateStructureObject[]
): Promise<true> => {
  // get structure from IDB
  let storedPrivateStructure = await ((getDatabaseStructure(
    PRIVATE_STRUCTURE
  ) as unknown) as IPrivateStructureIndexedDBObject | false);

  // get names of the heirarchy documents from IDB -> this is kept in sync
  let tagidToTagname = (await (getDatabaseStructure(
    TAGID_TO_TAGNAME_MAP
  ) as unknown)) as { keyPath: string; data: ITagidToTagnameMap } | false;

  // if no names map found
  if (!tagidToTagname) {
    const { activeCompany } = await getVariableServerPaths();
    if (!activeCompany) return true;
    // get name map from server
    const doc = await firestore
      .collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .get();
    const data = doc.data();
    if (!data) return true;

    tagidToTagname = { keyPath: "tag", data: data[TAGID_TO_TAGNAME_MAP] };
    // if still no name map, serious error may be there
    if (!tagidToTagname) return true;
  }

  let diffs: PrivateStructureMap;
  let deletionMap: IDeletionMap;
  // if there is data in IDB
  if (storedPrivateStructure) {
    // compare data from server and local, diffs is an Map containing the differces between the two data
    // deletionMap has the felds that need to be deleted from the localstructure
    ({ diffs, deletionMap } = returnDiffs(
      serverData,
      storedPrivateStructure.data,
      tagidToTagname.data
    ));

    if (deletionMap) {
      // these tags need to be deleted
      const affectedtags = Object.keys(deletionMap);
      affectedtags.forEach(tag => {
        if (
          deletionMap[tag] &&
          deletionMap[tag].mainTag &&
          storedPrivateStructure
        ) {
          // delete these tags, from an mutable structure from IDB
          storedPrivateStructure.data.delete(tag);
        }
      });
    }
    // if there were no differences between the data, no need to do anything, everything is updated
    if (diffs.size === 0 && Object.keys(deletionMap).length === 0) {
      return true;
    }
    // else, execute the diffs
    const diffIterator = diffs.entries();
    let currentDiff = diffIterator.next();

    while (!currentDiff.done) {
      // this may add or modify tag pertaining to a tag on the localstore
      storedPrivateStructure.data.set(
        currentDiff.value[0],
        currentDiff.value[1]
      );
      currentDiff = diffIterator.next();
    }
    // add it to IDB for future reference and offline caching
    addDatabaseStructureData(storedPrivateStructure);
    // sync state with new object, this will do on every realtime sync
    store.dispatch(SyncPrivateStructureMap(storedPrivateStructure.data));
    return true;
  } else {
    // this means no data was there in IDB, we just copy the entire public data in this case over to IDB and state
    // this might mean either IDB was emptied or error or first time sync
    ({ diffs } = returnDiffs(serverData, null, tagidToTagname.data));
    addDatabaseStructureData({
      keyPath: PRIVATE_STRUCTURE,
      data: diffs
    });
    store.dispatch(SyncPrivateStructureMap(diffs));
    return true;
  }
};
