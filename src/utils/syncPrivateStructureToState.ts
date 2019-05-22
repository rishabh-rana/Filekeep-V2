import { getDatabaseStructure } from "../APIs/indexedDb/databaseHeirarchyStructure";
import {
  PRIVATE_STRUCTURE,
  IPrivateStructureIndexedDBObject
} from "../typesAndConstants/appTypes";
import store from "../store";
import { SyncPrivateStructureMap } from "../modules/appActionCreator";

export const syncPrivateStructureToState = async (): Promise<boolean> => {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
    // get data from indexedDb
    let isSuccess = true;

    const data = await ((getDatabaseStructure(PRIVATE_STRUCTURE) as unknown) as
      | IPrivateStructureIndexedDBObject
      | false);

    // if taglist existed, update state
    if (data !== false) {
      store.dispatch(SyncPrivateStructureMap(data.data));
    } else {
      isSuccess = false;
    }

    resolve(isSuccess);
  });

  return promise;
};
