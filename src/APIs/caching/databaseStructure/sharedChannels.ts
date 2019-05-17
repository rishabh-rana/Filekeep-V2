import { firestore } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  USERS_SUBCOLLECTION
} from "../../../typesAndConstants/firestoreConstants";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseStructure";
import store from "../../../store";
import {
  SHARED_DATABASE_STRUCTURE,
  SHARED_FUSE_INDICES,
  IDatabaseStructure_SERVER,
  IFuseIndex,
  IDatabaseStructure_INDEXEDDB
} from "../../../typesAndConstants/appTypes";
import { SyncSharedFuseIndicesCreator } from "../../../modules/appActionCreator";
import { isDataSame, preparefuseindices } from "./util";

export const updateAndCacheSharedFuseIndices = async (): Promise<
  boolean | undefined
> => {
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

  const shared_structure_from_server: IDatabaseStructure_SERVER =
    serverData[SHARED_DATABASE_STRUCTURE];

  const storedRootData = await ((getDatabaseStructure(
    SHARED_DATABASE_STRUCTURE
  ) as unknown) as IDatabaseStructure_INDEXEDDB | false);

  if (!storedRootData && serverData && serverData[SHARED_DATABASE_STRUCTURE]) {
    addDatabaseStructureData({
      keyPath: SHARED_DATABASE_STRUCTURE,
      data: shared_structure_from_server
    });
  }

  if (
    storedRootData &&
    isDataSame(shared_structure_from_server, storedRootData)
  ) {
    return true;
  } else {
    // do later
    const sharedFuseIndices: IFuseIndex[] = preparefuseindices(
      shared_structure_from_server
    );
    addDatabaseStructureData({
      keyPath: SHARED_DATABASE_STRUCTURE,
      data: shared_structure_from_server
    });
    addDatabaseStructureData({
      keyPath: SHARED_FUSE_INDICES,
      data: sharedFuseIndices
    });
    store.dispatch(SyncSharedFuseIndicesCreator(sharedFuseIndices));
  }
};
