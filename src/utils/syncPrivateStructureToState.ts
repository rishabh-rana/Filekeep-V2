import { getDatabaseStructure } from "../APIs/indexedDb/databaseHeirarchyStructure";
import {
  PRIVATE_STRUCTURE,
  IPrivateStructureIndexedDBObject,
  TAGID_TO_TAGNAME_MAP,
  ITagidToTagnameMap
} from "../modules/appTypes";
import store from "../store";
import {
  SyncPrivateStructureMap,
  SyncNameMap
} from "../modules/appActionCreator";

export const syncPrivateStructureToState = async (): Promise<boolean> => {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
    // get data from indexedDb
    let isSuccess = true;

    const data = await ((getDatabaseStructure(PRIVATE_STRUCTURE) as unknown) as
      | IPrivateStructureIndexedDBObject
      | false);

    // if taglist existed, update state
    if (data !== false) {
      console.log("FUCK UP HERE", data.data);
      store.dispatch(SyncPrivateStructureMap(data.data));
    } else {
      isSuccess = false;
    }

    const nameMap = (await (getDatabaseStructure(
      TAGID_TO_TAGNAME_MAP
    ) as unknown)) as ITagidToTagnameMap | false;

    if (nameMap !== false) {
      store.dispatch(SyncNameMap(nameMap));
    } else {
      isSuccess = false;
    }

    resolve(isSuccess);
  });

  return promise;
};
