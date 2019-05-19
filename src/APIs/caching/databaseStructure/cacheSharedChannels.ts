import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  USERS_SUBCOLLECTION
} from "../../../typesAndConstants/firestoreConstants";
import {
  SHARED_DATABASE_STRUCTURE,
  SHARED_FUSE_INDICES
} from "../../../typesAndConstants/appTypes";
import { SyncSharedFuseIndicesCreator } from "../../../modules/appActionCreator";
import {
  performCachingOperation,
  updateActiveCompany
} from "./helperFunctions";

// Get the structure shared with user from the server
// Get locally stored shared structure from IndexedDB
// If structures Dont match => construct new Fuse Indices (For Autocomplete Search Bar)
// Store Fuse Indices and New structure in the DB and displatch the new Indices to state
// If any error, the indices are left untouched, resulting in either old indices until reload (not a big issue) or indices as false => this case needs to be handled

export const updateAndCacheSharedFuseIndices = async (): Promise<boolean> => {
  const activeCompany = localStorage.getItem("activeCompany");
  const uid = localStorage.getItem("uid");

  // no active company
  if (!activeCompany) return false;
  // no uid
  if (!uid) return false;

  const doc = await firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .collection(USERS_SUBCOLLECTION)
    .doc(uid)
    .get();
  const serverData = doc.data();

  if (!serverData) {
    // no data on server
    return false;
  }
  firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .collection(USERS_SUBCOLLECTION)
    .doc(uid)
    .onSnapshot(async doc => {
      const serverData = doc.data();

      if (!serverData) return;

      const success = await performCachingOperation(
        serverData[SHARED_DATABASE_STRUCTURE],
        SHARED_DATABASE_STRUCTURE,
        SHARED_FUSE_INDICES,
        SyncSharedFuseIndicesCreator
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
            serverData[SHARED_DATABASE_STRUCTURE],
            SHARED_DATABASE_STRUCTURE,
            SHARED_FUSE_INDICES,
            SyncSharedFuseIndicesCreator
          );
        }
      }
    });

  return true;
};
