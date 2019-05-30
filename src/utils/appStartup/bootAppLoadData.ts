import { getDatabaseStructure } from "../../APIs/indexedDb/databaseHeirarchyStructure";
import {
  PRIVATE_STRUCTURE,
  IPrivateStructureIndexedDBObject,
  TAGID_TO_TAGNAME_MAP,
  ITagNameToTagidMapIndexedDbObject,
  ITagidToTagnameMapIndexedDBObject,
  TAGNAME_TO_TAGID_MAP
} from "../../modules/appTypes";
import store from "../../store";
import {
  SyncPrivateStructureMap,
  SyncNameMap
} from "../../modules/appActionCreator";

export const bootAppLoadData = async (): Promise<boolean> => {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
    // get data from indexedDb
    let isSuccess = true;

    const nameMap = (await (getDatabaseStructure(
      TAGID_TO_TAGNAME_MAP
    ) as unknown)) as ITagidToTagnameMapIndexedDBObject | false;

    const reversenameMap = ((await getDatabaseStructure(
      TAGNAME_TO_TAGID_MAP
    )) as unknown) as ITagNameToTagidMapIndexedDbObject | false;

    if (nameMap !== false && reversenameMap !== false) {
      store.dispatch(SyncNameMap(nameMap.data, reversenameMap.data));
    }

    const data = await ((getDatabaseStructure(PRIVATE_STRUCTURE) as unknown) as
      | IPrivateStructureIndexedDBObject
      | false);

    // if taglist existed, update state
    if (data !== false) {
      console.log(data.data);
      store.dispatch(SyncPrivateStructureMap(data.data));
    } else {
      isSuccess = false;
    }

    resolve(isSuccess);
  });

  return promise;
};
