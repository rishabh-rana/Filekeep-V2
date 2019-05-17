import { getDatabaseStructure } from "../APIs/indexedDb/databaseStructure";
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

export const syncFuseIndicesFromDB = async (): Promise<true> => {
  const promise: Promise<true> = new Promise(async (resolve, reject) => {
    // get data from indexedDb

    const rootData = await ((getDatabaseStructure(
      ROOT_FUSE_INDICES
    ) as unknown) as IFuseIndices_INDEXEDDB | false);

    const sharedData = await ((getDatabaseStructure(
      SHARED_FUSE_INDICES
    ) as unknown) as IFuseIndices_INDEXEDDB | false);

    // if taglist existed, update state
    if (rootData !== false) {
      store.dispatch(SyncRootFuseIndicesCreator(rootData.data));
    }

    // if taglist existed, update state
    if (sharedData !== false) {
      store.dispatch(SyncSharedFuseIndicesCreator(sharedData.data));
    }

    resolve(true);
  });

  return promise;
};
