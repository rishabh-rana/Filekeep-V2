import {
  IDatabaseStructure_INDEXEDDB,
  IDatabaseStructure_SERVER,
  IFuseIndex
} from "../../../typesAndConstants/appTypes";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseHeirarchyStructure";
import store from "../../../store";

import { firestore } from "../../../config/firebase";
import {
  USER_COLLECTION,
  INFORMATION_SUBCOLLECTION,
  PRIVATE_INFORMATION
} from "../../../typesAndConstants/firestoreConstants";

const isArrayEqual = (arrayOne: string[], arrayTwo: string[]): boolean => {
  let isEqual = true;

  if (arrayOne.length !== arrayTwo.length) return false;

  arrayOne.forEach((data: string, index: number) => {
    if (data !== arrayTwo[index]) isEqual = false;
  });

  return isEqual;
};

const isDataSame = (
  serverData: IDatabaseStructure_SERVER,
  localData: IDatabaseStructure_INDEXEDDB
): boolean => {
  let isSame: boolean = true;

  if (Object.keys(serverData).length !== Object.keys(localData.data).length) {
    return false;
  }

  Object.keys(serverData).forEach(tag => {
    if (!localData.data[tag]) {
      isSame = false;
      return;
    }
    if (!isArrayEqual(serverData[tag], localData.data[tag])) isSame = false;
  });

  return isSame;
};

const preparefuseindices = (data: IDatabaseStructure_SERVER): IFuseIndex[] => {
  const unpackArray = (array: string[]): any => {
    const obj: any = {};
    array.forEach((tag: any) => {
      obj[tag] = true;
    });
    return obj;
  };

  let rootFuseIndices: any[] = [];

  Object.keys(data).forEach(tag => {
    rootFuseIndices.push({
      tag: tag,
      parents: unpackArray(data[tag])
    });
  });

  return rootFuseIndices;
};

export const performCachingOperation = async (
  structureFromServer: IDatabaseStructure_SERVER,
  IndexedDBKeypath_Structure: string,
  IndexedDBKeypath_Indices: string,
  SyncFuseIndicesCreator: (fuseIndices: IFuseIndex[]) => any
): Promise<boolean> => {
  let storedRootData = await ((getDatabaseStructure(
    IndexedDBKeypath_Structure
  ) as unknown) as IDatabaseStructure_INDEXEDDB | false);

  if (!storedRootData && structureFromServer) {
    addDatabaseStructureData({
      keyPath: IndexedDBKeypath_Structure,
      data: structureFromServer
    });
  }

  if (storedRootData && isDataSame(structureFromServer, storedRootData)) {
    return true;
  } else {
    // prepare and sync indices
    const FuseIndices: IFuseIndex[] = preparefuseindices(structureFromServer);
    addDatabaseStructureData({
      keyPath: IndexedDBKeypath_Structure,
      data: structureFromServer
    });
    addDatabaseStructureData({
      keyPath: IndexedDBKeypath_Indices,
      data: FuseIndices
    });

    store.dispatch(SyncFuseIndicesCreator(FuseIndices));
    return true;
  }
};

const getUid = () => {
  const state = store.getState();
  // it is synced to actual auth
  return state.authenticationState.uid;
};

export const updateActiveCompany = async (): Promise<boolean> => {
  const uid = getUid();
  if (uid) {
    const userDoc = await firestore
      .collection(USER_COLLECTION)
      .doc(uid)
      .collection(INFORMATION_SUBCOLLECTION)
      .doc(PRIVATE_INFORMATION)
      .get();
    const data = userDoc.data();
    if (data && data.active_project) {
      localStorage.setItem("activeCompany", data.active_project);

      return true;
    }
  }

  return false;
};
