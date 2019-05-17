import { firestore } from "../../../config/firebase";
import { COMPANIES_COLLECTION } from "../../../typesAndConstants/firestoreConstants";
import {
  getRootDatabaseStructure,
  addRootDatabaseStructureData
} from "../../indexedDb/rootDatabaseStructure";
import store from "../../../store";
import {
  ROOT_DATABASE_STRUCTURE,
  ROOT_FUSE_INDICES,
  IRootDatabaseStructure_SERVER,
  IFuseIndex,
  IRootDatabaseStructure_INDEXEDDB
} from "../../../typesAndConstants/appTypes";
import { SyncRootFuseIndicesCreator } from "../../../modules/appActionCreator";

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

  const root_structure_from_server: IRootDatabaseStructure_SERVER =
    serverData[ROOT_DATABASE_STRUCTURE];

  const storedRootData = await ((getRootDatabaseStructure(
    ROOT_DATABASE_STRUCTURE
  ) as unknown) as IRootDatabaseStructure_INDEXEDDB | false);

  if (!storedRootData && serverData && serverData[ROOT_DATABASE_STRUCTURE]) {
    addRootDatabaseStructureData({
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
    addRootDatabaseStructureData({
      keyPath: ROOT_DATABASE_STRUCTURE,
      data: root_structure_from_server
    });
    addRootDatabaseStructureData({
      keyPath: ROOT_FUSE_INDICES,
      data: rootFuseIndices
    });
    store.dispatch(SyncRootFuseIndicesCreator(rootFuseIndices));
  }
};

const isArrayEqual = (arrayOne: string[], arrayTwo: string[]): boolean => {
  let isEqual = true;

  if (arrayOne.length !== arrayTwo.length) return false;

  arrayOne.forEach((data: string, index: number) => {
    if (data !== arrayTwo[index]) isEqual = false;
  });

  return isEqual;
};

const isDataSame = (
  serverData: IRootDatabaseStructure_SERVER,
  localData: IRootDatabaseStructure_INDEXEDDB
): boolean => {
  let isSame: boolean = true;
  Object.keys(serverData).forEach(tag => {
    if (!localData.data[tag]) isSame = false;
    if (!isArrayEqual(serverData[tag], localData.data[tag])) isSame = false;
  });
  console.log(isSame);
  return isSame;
};

const preparefuseindices = (
  data: IRootDatabaseStructure_SERVER
): IFuseIndex[] => {
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
