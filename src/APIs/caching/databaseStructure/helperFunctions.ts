import {
  IRawPrivateStructureObject,
  PrivateStructureMap,
  ITagidToTagnameMap,
  IDeletionMap,
  IPrivateStructureObject
} from "../../../modules/appTypes";

// this function compares two arrays and returns the  items that were missing from ArrayOne wrt Array two
const calculateParentsToBeDeleted = (
  arrayOne: string[],
  arrayTwo: string[]
): { isEqual: boolean; parentDiffs: string[] | null } => {
  //
  let parentDiffs: string[] | null = null;
  let isEqual = true;
  // if arrayone is smaller, then we need to return missing items
  if (arrayOne.length < arrayTwo.length) {
    const helper: string[] = [];
    // add missing items to helper array
    arrayTwo.forEach(item => {
      if (arrayOne.indexOf(item) === -1) {
        helper.push(item);
      }
    });
    // set deletionDiff to helper array
    parentDiffs = helper;
    return {
      isEqual: false,
      parentDiffs
    };
  }

  // check equality of individual items
  arrayOne.forEach((data: string, index: number) => {
    if (data !== arrayTwo[index]) isEqual = false;
  });
  // return diffs and isEqual
  return { isEqual, parentDiffs };
};

export const returnDiffs = (
  serverData: IRawPrivateStructureObject[],
  localDataMap: PrivateStructureMap | false,
  tagIdToTagNameMap: ITagidToTagnameMap
): {
  copyOfServerData: PrivateStructureMap | false;
  deletionMap: IDeletionMap;
} => {
  const serverDataMap: PrivateStructureMap = new Map();
  // this is the difference map to be returned
  const deletionMap: IDeletionMap = {};
  let isBothDataEqual: boolean = true;
  const time = Date.now();
  // make new map from server
  serverData.forEach(obj => {
    const { tag } = obj;
    if (localDataMap && !localDataMap.has(tag)) {
      // tells if there was a new insertion
      isBothDataEqual = false;
    }
    serverDataMap.set(tag, {
      tag,
      parents: obj.parents,
      tagName: tagIdToTagNameMap[tag]
    });
  });
  console.log("MAPPING OP", Date.now() - time);

  // return the new map if no local data was there
  if (!localDataMap) {
    return {
      copyOfServerData: serverDataMap,
      deletionMap: {}
    };
  }
  // if localDataMap !== null, calculate deletions, if any
  const iterator = localDataMap.values();
  let currentIterator = iterator.next();

  while (!currentIterator.done) {
    const { tag } = currentIterator.value;
    let serverDoc = serverDataMap.get(tag);

    if (serverDoc) {
      const { parentDiffs, isEqual } = calculateParentsToBeDeleted(
        //@ts-ignore
        serverDoc.parents,
        currentIterator.value.parents
      );
      if (parentDiffs) {
        // add parents deletions to deletionMap
        deletionMap[tag] = {
          parents: parentDiffs
        };
        // tells a parent was deleted
        isBothDataEqual = false;
      }
      // tells a parent was modified
      if (!isEqual) {
        isBothDataEqual = false;
      }
    } else {
      // add tag deletions to deletionMap
      deletionMap[tag] = {
        mainTag: tag
      };
      // tells a tag was deleted
      isBothDataEqual = false;
    }
    currentIterator = iterator.next();
  }
  console.log("Dele", Date.now() - time);

  // return diffs
  return {
    copyOfServerData: isBothDataEqual ? false : serverDataMap,
    deletionMap
  };
};
