import { firestore } from "../../../config/firebase";
import { COMPANIES_COLLECTION } from "../../../config/firestoreConstants";

import {
  PUBLIC_STRUCTURE,
  TAGID_TO_TAGNAME_MAP,
  IRawPrivateStructureObject,
  ITagidToTagnameMap,
  IPrivateStructureIndexedDBObject,
  PrivateStructureMap,
  IDeletionMap,
  PRIVATE_STRUCTURE
} from "../../../modules/appTypes";
import { returnDiffs } from "./helperFunctions";
import { getVariableServerPaths } from "../../../utils/getVariableServerPaths";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseHeirarchyStructure";
import store from "../../../store";
import { SyncPrivateStructureMap } from "../../../modules/appActionCreator";

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

      if (serverData[TAGID_TO_TAGNAME_MAP]) {
        // sync name map
        addDatabaseStructureData({
          keyPath: TAGID_TO_TAGNAME_MAP,
          data: serverData[TAGID_TO_TAGNAME_MAP]
        });
      }

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

  // publicStructureDiffs denote the changes between server and local data
  let publicStructureDiffs: PrivateStructureMap | false;
  // this map contains tags to be deleted
  let deletionDiffs: IDeletionMap | null = null;

  if (!storedPublicStructure && publicStructureFromServer) {
    // no local structure available, and we got response from server, just sync entire thing from server
    // diffs will denote the complete Map to take union with the private structure
    const { diffs } = returnDiffs(
      publicStructureFromServer,
      null,
      tagIdToTagNameMap
    );
    publicStructureDiffs = diffs;
  } else if (storedPublicStructure && publicStructureFromServer) {
    // if local structure was present, compare and return diffs to be executed, along with deletionMap
    const { diffs, deletionMap } = returnDiffs(
      publicStructureFromServer,
      storedPublicStructure.data,
      tagIdToTagNameMap
    );

    publicStructureDiffs = diffs;
    deletionDiffs = deletionMap;
  } else {
    // no response from server
    publicStructureDiffs = false;
  }

  if (publicStructureDiffs !== false && publicStructureDiffs.size === 0) {
    // zero size diffs imply no diffs generated
    publicStructureDiffs = false;
  }

  if (
    storedPublicStructure &&
    publicStructureDiffs === false &&
    deletionDiffs &&
    Object.keys(deletionDiffs).length === 0
  ) {
    // if no diffs and no deletionDiffs exist, we are in sync, dont do anything
    return true;
  } else if (!storedPublicStructure && publicStructureDiffs) {
    // first time sync, so update IDB public_structure path

    addDatabaseStructureData({
      keyPath: PUBLIC_STRUCTURE,
      data: publicStructureDiffs
    });
  } else if (
    storedPublicStructure &&
    publicStructureDiffs === false &&
    deletionDiffs
  ) {
    // no positiveDifferences but deletions detected
    const affectedTags = Object.keys(deletionDiffs);

    affectedTags.forEach(tag => {
      if (deletionDiffs && storedPublicStructure) {
        if (deletionDiffs[tag].mainTag) {
          storedPublicStructure.data.delete(tag);
        } else if (deletionDiffs[tag].parents) {
          const currentData = storedPublicStructure.data.get(tag);
          const deleteTheseParents = deletionDiffs[tag].parents;
          if (deleteTheseParents && currentData) {
            deleteTheseParents.forEach(item => {
              currentData.parents.splice(currentData.parents.indexOf(item), 1);
            });
          }
          if (currentData) {
            storedPublicStructure.data.set(tag, currentData);
          }
        }
      }
    });
    // delete the tags or parents as instructed by deletionMap, and sync to IDB
    addDatabaseStructureData(storedPublicStructure);
  } else if (storedPublicStructure && publicStructureDiffs) {
    // some positive differences were found
    const diffs = publicStructureDiffs.entries();

    let currentDiff = diffs.next();

    if (deletionDiffs) {
      // there exist deletion commands, handle them here
      const affectedTags = Object.keys(deletionDiffs);

      affectedTags.forEach(tag => {
        if (deletionDiffs && storedPublicStructure) {
          if (deletionDiffs[tag].mainTag) {
            storedPublicStructure.data.delete(tag);
          } else if (deletionDiffs[tag].parents) {
            const currentData = storedPublicStructure.data.get(tag);
            const deleteTheseParents = deletionDiffs[tag].parents;
            if (deleteTheseParents && currentData) {
              deleteTheseParents.forEach(item => {
                currentData.parents.splice(
                  currentData.parents.indexOf(item),
                  1
                );
              });
            }
            if (currentData) {
              storedPublicStructure.data.set(tag, currentData);
            }
          }
        }
      });
    }
    // handle modifications and additions
    while (!currentDiff.done) {
      storedPublicStructure.data.set(
        currentDiff.value[0],
        currentDiff.value[1]
      );
      currentDiff = diffs.next();
    }
    // sync now up-to-date structure to IDB
    addDatabaseStructureData(storedPublicStructure);
  }

  //
  //
  //
  // SYNCED PUBLIC STRUTURE WITH IDB NOW ONWARDS TO TAKE UNION WITH PRIVATE STRUCTURE
  //
  //
  //

  // now we need to union this PublicMap with our private structure, if there were any changes detected to the public structure
  if (
    publicStructureDiffs ||
    (deletionDiffs && Object.keys(deletionDiffs).length !== 0)
  ) {
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
        deletionDiffs &&
        deletionDiffs[currentPrivateObject.value[0]] &&
        deletionDiffs[currentPrivateObject.value[0]].mainTag
      ) {
        // do nothing, as in do not copy this tag as it has been deleted
      } else {
        finalStructure.set(currentPrivateObject.value[0], {
          ...currentPrivateObject.value[1],
          parents: [...currentPrivateObject.value[1].parents]
        });
      }

      currentPrivateObject = privateStructureIterator.next();
    }
    // copies the priateStructure to finalStructure variable, that is made a mutable copy

    // if differences were found, execute them on finalStructure
    if (publicStructureDiffs) {
      const publicDiffs = publicStructureDiffs.entries();
      let currentDiff = publicDiffs.next();

      while (!currentDiff.done) {
        const tag = currentDiff.value[0];
        // if we need to modify a tag on finalStructure
        if (finalStructure.has(tag)) {
          let parents: string[];
          const objectOfFinalStructure = finalStructure.get(tag);
          if (objectOfFinalStructure) {
            parents = [
              ...currentDiff.value[1].parents,
              ...objectOfFinalStructure.parents
            ];
            const helper: any = {};
            parents.forEach(item => {
              helper[item] = true;
            });
            //handle deletion
            if (deletionDiffs && deletionDiffs[tag]) {
              // deletion commands exist for this tag
              if (deletionDiffs[tag].parents !== undefined) {
                // deletion exist for parents
                //@ts-ignore
                deletionDiffs[tag].parents.forEach(item => {
                  delete helper[item];
                });
              }
            }
            parents = Object.keys(helper);
            finalStructure.set(tag, {
              tag,
              tagName: currentDiff.value[1].tagName,
              parents
            });
          }
        } else {
          // there was no such tag on finalStructure, simply add this one
          finalStructure.set(tag, {
            tag,
            tagName: currentDiff.value[1].tagName,
            parents: [...currentDiff.value[1].parents]
          });
        }
        currentDiff = publicDiffs.next();
      }
    }
    // now finalStructure represents union of Public Structure and Private Structure, both synced realtime to server!
    // set this to state, and cache in IDB
    store.dispatch(SyncPrivateStructureMap(finalStructure));
    addDatabaseStructureData({
      keyPath: PRIVATE_STRUCTURE,
      data: finalStructure
    });
  }
  // exit call
  return true;
};

const getPrivateStructureFromState = (): PrivateStructureMap | null => {
  return store.getState().app.private_structure;
};
