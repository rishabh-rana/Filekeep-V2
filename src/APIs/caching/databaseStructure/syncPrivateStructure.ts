import { firestore, functions } from "../../../config/firebase";
import {
  COMPANIES_COLLECTION,
  USERS_SUBCOLLECTION
} from "../../../config/firestoreConstants";
import { getVariableServerPaths } from "../../../utils/getVariableServerPaths";
import {
  getDatabaseStructure,
  addDatabaseStructureData
} from "../../indexedDb/databaseHeirarchyStructure";
import {
  PRIVATE_STRUCTURE,
  IPrivateStructureIndexedDBObject,
  ITagidToTagnameMap,
  IServerPrivateStructureObject,
  TAGID_TO_TAGNAME_MAP
} from "../../../modules/appTypes";
import { returnDiffs } from "./helperFunctions";
import store from "../../../store";
import { SyncPrivateStructureMap } from "../../../modules/appActionCreator";

// this method syncs in realtime, the private assets on this company container shared with current user

export const syncPrivateStructure = (): Promise<() => void> => {
  // return a promise to invoke next caching methof after this has completed
  const promise: Promise<() => void> = new Promise(async (resolve, reject) => {
    // this method will resolve only once, not on every realtime update
    let resolveOnce = (unsub: () => void) => {
      resolveOnce = () => {};
      resolve(unsub);
    };
    // get activeCompany and uid from redux
    const { activeCompany, uid } = await getVariableServerPaths();
    // if no data, it may be an error or the user may be offline and have deleted local storage
    // we will still sync data from indexedDb to state from another method
    if (!activeCompany || !uid) {
      resolveOnce(() => {});
      return;
    }
    // set up realtime listener
    const unsubscribe = firestore
      .collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .collection(USERS_SUBCOLLECTION)
      .doc(uid)
      .onSnapshot(async doc => {
        const serverData = doc.data();

        if (!serverData) {
          resolveOnce(unsubscribe);
          return;
        }
        // if no private_strucutre field exist on the data from server
        // just ignore snapshot newone will come
        if (!serverData[PRIVATE_STRUCTURE]) {
          resolveOnce(unsubscribe);
          return;
        }

        // successfully got serverData
        await syncOperation(serverData[PRIVATE_STRUCTURE]);
        resolveOnce(unsubscribe);
      });
  });
  return promise;
};

const syncOperation = async (
  serverData: IServerPrivateStructureObject
): Promise<true> => {
  // get structure from IDB
  let storedPrivateStructure = await ((getDatabaseStructure(
    PRIVATE_STRUCTURE
  ) as unknown) as IPrivateStructureIndexedDBObject | false);

  // get names corresponding to the tagids from IDB -> this is kept in sync
  let tagidToTagname = (await (getDatabaseStructure(
    TAGID_TO_TAGNAME_MAP
  ) as unknown)) as { keyPath: string; data: ITagidToTagnameMap } | false;

  // if no name map found, ask for one from server
  if (!tagidToTagname) {
    const { activeCompany } = await getVariableServerPaths();
    if (!activeCompany) return true;
    // get name map from server
    const doc = await firestore
      .collection(COMPANIES_COLLECTION)
      .doc(activeCompany)
      .get();
    const data = doc.data();
    if (!data) return true;

    tagidToTagname = { keyPath: "tag", data: data[TAGID_TO_TAGNAME_MAP] };
    // if still no name map, serious error may be there
    if (!tagidToTagname) return true;
  }

  const { copyOfServerData } = returnDiffs(
    serverData,
    storedPrivateStructure ? storedPrivateStructure.data : false,
    tagidToTagname.data
  );

  if (copyOfServerData) {
    // add it to IDB for future reference and offline caching
    addDatabaseStructureData({
      keyPath: PRIVATE_STRUCTURE,
      data: copyOfServerData
    });

    // sync state with new object, this will do on every realtime sync
    store.dispatch(SyncPrivateStructureMap(copyOfServerData));
  }

  return true;
};
