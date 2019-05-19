import { getDatabaseStructure } from "../APIs/indexedDb/databaseHeirarchyStructure";
import {
  ROOT_FUSE_INDICES,
  SHARED_FUSE_INDICES,
  IFuseIndices_INDEXEDDB
} from "../typesAndConstants/appTypes";
import store from "../store";
import {
  SyncRootFuseIndicesCreator,
  SyncSharedFuseIndicesCreator
} from "../modules/appActionCreator";

export const syncFuseIndicesFromDB = async (): Promise<boolean> => {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
    // get data from indexedDb
    let isSuccess = true;

    const rootData = await ((getDatabaseStructure(
      ROOT_FUSE_INDICES
    ) as unknown) as IFuseIndices_INDEXEDDB | false);

    const sharedData = await ((getDatabaseStructure(
      SHARED_FUSE_INDICES
    ) as unknown) as IFuseIndices_INDEXEDDB | false);

    // if taglist existed, update state
    if (rootData !== false) {
      store.dispatch(SyncRootFuseIndicesCreator(rootData.data));
    } else {
      isSuccess = false;
    }

    // if taglist existed, update state
    if (sharedData !== false) {
      store.dispatch(SyncSharedFuseIndicesCreator(sharedData.data));
    } else {
      isSuccess = false;
    }

    resolve(isSuccess);
  });

  return promise;
};
