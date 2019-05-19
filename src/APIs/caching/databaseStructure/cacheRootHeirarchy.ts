import { firestore } from "../../../config/firebase";
import { COMPANIES_COLLECTION } from "../../../typesAndConstants/firestoreConstants";

import {
  ROOT_DATABASE_STRUCTURE,
  ROOT_FUSE_INDICES
} from "../../../typesAndConstants/appTypes";
import { SyncRootFuseIndicesCreator } from "../../../modules/appActionCreator";
import {
  performCachingOperation,
  updateActiveCompany
} from "./helperFunctions";

// Get the root heirarchy structure from the server
// Get locally stored structure from IndexedDB
// If structures Dont match => construct new Fuse Indices (For Autocomplete Search Bar)
// Store Fuse Indices and New structure in the DB and displatch the new Indices to state
// If any error, the indices are left untouched, resulting in either old indices until reload (not a big issue) or indices as false => this case needs to be handled

export const updateAndCacheFuseIndices = async (): Promise<boolean> => {
  const activeCompany = localStorage.getItem("activeCompany");

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

      const success = await performCachingOperation(
        serverData[ROOT_DATABASE_STRUCTURE],
        ROOT_DATABASE_STRUCTURE,
        ROOT_FUSE_INDICES,
        SyncRootFuseIndicesCreator
      );

      // if caching operation failed, retry it again
      // possible failure reasons: random error in IndexedDB or incorrect activeCompany in localstorage

      if (!success) {
        // update activeCompany on localStorage, most probable reason for error
        const updatedCompany = await updateActiveCompany();
        if (updatedCompany) {
          // if company succesfullt updated, try caching again, if it fails handle
          // the absence of indices on the appState -> display an error
          performCachingOperation(
            serverData[ROOT_DATABASE_STRUCTURE],
            ROOT_DATABASE_STRUCTURE,
            ROOT_FUSE_INDICES,
            SyncRootFuseIndicesCreator
          );
        }
      }
    });

  return true;
};
