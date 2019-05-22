import { getDatabaseStructure } from "../APIs/indexedDb/databaseHeirarchyStructure";
import {
  ROOT_FUSE_INDICES,
  SHARED_FUSE_INDICES,
  IFuseIndices_INDEXEDDB,
  PRIVATE_STRUCTURE,
  PrivateStructureMap,
  IPrivateStructureIndexedDBObject
} from "../typesAndConstants/appTypes";
import store from "../store";
import {
  SyncRootFuseIndicesCreator,
  SyncSharedFuseIndicesCreator,
  SyncPrivateStructureMap
} from "../modules/appActionCreator";
import { firestore } from "../config/firebase";

// export const syncFuseIndicesFromDB = async (): Promise<boolean> => {
//   const promise: Promise<boolean> = new Promise(async (resolve, reject) => {
//     // get data from indexedDb
//     let isSuccess = true;

//     const rootData = await ((getDatabaseStructure(
//       ROOT_FUSE_INDICES
//     ) as unknown) as IFuseIndices_INDEXEDDB | false);

//     const sharedData = await ((getDatabaseStructure(
//       SHARED_FUSE_INDICES
//     ) as unknown) as IFuseIndices_INDEXEDDB);

//     const newData: any[] = [];

//     sharedData.data.forEach(index => {
//       const helper: any[] = [];
//       Object.keys(index.parents).forEach(parent => {
//         if (parent === "__APP__") {
//           helper.push("tagid__Filekeep");
//         } else {
//           helper.push("tagid__" + parent);
//         }
//       });

//       newData.push({
//         tag: "tagid__" + index.tag,
//         parents: helper
//       });
//     });

//     console.log(newData);

//     // firestore
//     //   .collection("companies")
//     //   .doc("Filekeep")
//     //   .update({
//     //     public_structure: newData
//     //   });

//     // firestore
//     //   .collection("companies")
//     //   .doc("Filekeep")
//     //   .collection("users")
//     //   .doc("nsNMJHAUFvaPfdFsFydDkD0TP8H2")
//     //   .update({
//     //     private_structure: newData
//     //   });

//     // if taglist existed, update state
//     if (rootData !== false) {
//       store.dispatch(SyncRootFuseIndicesCreator(rootData.data));
//     } else {
//       isSuccess = false;
//     }

//     // if taglist existed, update state
//     if (sharedData) {
//       store.dispatch(SyncSharedFuseIndicesCreator(sharedData.data));
//     } else {
//       isSuccess = false;
//     }

//     resolve(isSuccess);
//   });

//   return promise;
// };

export const syncFuseIndicesFromDB = async (): Promise<boolean> => {
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
