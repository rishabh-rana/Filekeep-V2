import { IPrivateStructureIndexedDBObject } from "../../typesAndConstants/appTypes";
import { getVariableServerPaths } from "../../utils/getVariableServerPaths";

const databaseNameConstant = "appBootData";
const databaseNumber = 1;
const MAIN_OBJSTORE = "mainStore";
const MAIN_OBJSTORE_KEYPATH = "keyPath";

type ReturnData = Promise<IPrivateStructureIndexedDBObject | false>;

export const getDatabaseStructure = async (
  keyPath: string
): Promise<IPrivateStructureIndexedDBObject | false> => {
  const promise: ReturnData = new Promise(async (resolve, reject) => {
    if (!window.indexedDB) resolve(false);

    const { activeCompany } = await getVariableServerPaths();

    if (!activeCompany) resolve(false);

    const databaseName = databaseNameConstant + activeCompany;

    let request = window.indexedDB.open(databaseName, databaseNumber);
    let db: IDBDatabase;

    request.onerror = event => {
      // return error object later
      resolve(false);
    };

    request.onupgradeneeded = (event: any) => {
      // db = event.target.result;
      db = request.result;

      db.createObjectStore(MAIN_OBJSTORE, {
        keyPath: MAIN_OBJSTORE_KEYPATH
      });
    };

    request.onsuccess = (event: any) => {
      db = request.result;

      db.onerror = (event: any) => {
        // return error object later

        resolve(false);
      };

      getData();
    };

    const getData = () => {
      let transaction = db
        .transaction([MAIN_OBJSTORE], "readonly")
        .objectStore(MAIN_OBJSTORE);

      let req = transaction.get(keyPath);

      req.onerror = (event: any) => {
        resolve(false);
      };

      req.onsuccess = (event: any) => {
        if (req.result) {
          resolve(req.result);
        } else {
          resolve(false);
        }
      };
    };
  });

  return promise;
};

export const addDatabaseStructureData = (
  data: IPrivateStructureIndexedDBObject
): Promise<boolean> => {
  const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
    if (!window.indexedDB) resolve(false);

    const { activeCompany } = await getVariableServerPaths();

    if (!activeCompany) resolve(false);

    let databaseName = databaseNameConstant + activeCompany;

    let request = window.indexedDB.open(databaseName, databaseNumber);
    let db: IDBDatabase;

    request.onerror = event => {
      // return error object later
      resolve(false);
    };

    request.onupgradeneeded = (event: any) => {
      db = request.result;

      db.createObjectStore(MAIN_OBJSTORE, {
        keyPath: MAIN_OBJSTORE_KEYPATH
      });
    };

    request.onsuccess = (event: any) => {
      db = request.result;

      db.onerror = (event: any) => {
        // return error object later
        // console.log(event.target.errorCode);
        resolve(false);
      };

      addData();
    };

    const addData = () => {
      const transaction = db
        .transaction([MAIN_OBJSTORE], "readwrite")
        .objectStore(MAIN_OBJSTORE);

      const req = transaction.put(data);

      req.onerror = (event: any) => {
        resolve(false);
      };

      req.onsuccess = (event: any) => {
        resolve(true);
      };
    };
  });

  return promise;
};
