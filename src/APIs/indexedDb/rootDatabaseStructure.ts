import {
  IRootDatabaseStructure_INDEXEDDB,
  IRootFuseIndices_INDEXEDDB
} from "../../typesAndConstants/appTypes";

const databaseName = "coreCompanyData";
const databaseNumber = 1;
const MAIN_OBJSTORE = "mainStore";
const MAIN_OBJSTORE_KEYPATH = "keyPath";

type ReturnData = Promise<
  IRootDatabaseStructure_INDEXEDDB | IRootFuseIndices_INDEXEDDB | false
>;

export const getRootDatabaseStructure = (keyPath: string): ReturnData => {
  const promise: ReturnData = new Promise((resolve, reject) => {
    if (!window.indexedDB) resolve(false);

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
        console.log(event.target.errorCode);
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
          console.log("GOT DATA FROM DB", req.result);
          resolve(req.result);
        } else {
          resolve(false);
        }
      };
    };
  });

  return promise;
};

type InputData = IRootDatabaseStructure_INDEXEDDB | IRootFuseIndices_INDEXEDDB;

export const addRootDatabaseStructureData = (
  data: InputData
): Promise<boolean> => {
  const promise: Promise<boolean> = new Promise((resolve, reject) => {
    if (!window.indexedDB) resolve(false);

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
        console.log(event.target.errorCode);
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
        console.log("ADDED DATA TO DB");
        resolve(true);
      };
    };
  });

  return promise;
};
