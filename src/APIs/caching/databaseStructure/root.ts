import { firestore } from "../../../config/firebase";
import { COMPANIES_COLLECTION } from "../../../typesAndConstants/firestoreConstants";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseStructure";
import store from "../../../store";
import {
  ROOT_DATABASE_STRUCTURE,
  ROOT_FUSE_INDICES,
  IDatabaseStructure_SERVER,
  IFuseIndex,
  IDatabaseStructure_INDEXEDDB
} from "../../../typesAndConstants/appTypes";
import { SyncRootFuseIndicesCreator } from "../../../modules/appActionCreator";
import { isDataSame, preparefuseindices } from "./util";

export const updateAndCacheFuseIndices = async (): Promise<
  boolean | undefined
> => {
  const activeCompany = localStorage.getItem("activeCompany");

  // no active company
  if (!activeCompany) return false;

  const doc = await firestore
    .collection(COMPANIES_COLLECTION)
    .doc(activeCompany)
    .get();
  const serverData = doc.data();

  if (!serverData) {
    // no data on server
    return false;
  }

  const root_structure_from_server: IDatabaseStructure_SERVER =
    serverData[ROOT_DATABASE_STRUCTURE];

  const storedRootData = await ((getDatabaseStructure(
    ROOT_DATABASE_STRUCTURE
  ) as unknown) as IDatabaseStructure_INDEXEDDB | false);

  if (!storedRootData && serverData && serverData[ROOT_DATABASE_STRUCTURE]) {
    addDatabaseStructureData({
      keyPath: ROOT_DATABASE_STRUCTURE,
      data: root_structure_from_server
    });
  }

  if (
    storedRootData &&
    isDataSame(root_structure_from_server, storedRootData)
  ) {
    return true;
  } else {
    // do later
    const rootFuseIndices: IFuseIndex[] = preparefuseindices(
      root_structure_from_server
    );
    addDatabaseStructureData({
      keyPath: ROOT_DATABASE_STRUCTURE,
      data: root_structure_from_server
    });
    addDatabaseStructureData({
      keyPath: ROOT_FUSE_INDICES,
      data: rootFuseIndices
    });
    store.dispatch(SyncRootFuseIndicesCreator(rootFuseIndices));
  }
};
