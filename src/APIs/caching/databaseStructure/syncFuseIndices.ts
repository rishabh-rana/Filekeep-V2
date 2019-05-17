import { getRootDatabaseStructure } from "../../indexedDb/rootDatabaseStructure";
import {
  ROOT_FUSE_INDICES,
  IRootFuseIndices_INDEXEDDB
} from "../../../typesAndConstants/appTypes";
import store from "../../../store";
import { SyncRootFuseIndicesCreator } from "../../../modules/appActionCreator";

export const syncFuseIndicesFromDB = async (): Promise<true> => {
  const promise: Promise<true> = new Promise(async (resolve, reject) => {
    // get data from indexedDb

    const data = await ((getRootDatabaseStructure(
      ROOT_FUSE_INDICES
    ) as unknown) as IRootFuseIndices_INDEXEDDB | false);

    // if taglist existed, update state
    if (data !== false) {
      store.dispatch(SyncRootFuseIndicesCreator(data.data));
    }

    resolve(true);
  });

  return promise;
};
