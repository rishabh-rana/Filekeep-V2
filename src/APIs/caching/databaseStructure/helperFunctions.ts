import {
  IRawPrivateStructureObject,
  PrivateStructureMap,
  ITagidToTagnameMap,
  IDeletionMap
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
  if (!isEqual && arrayOne.length < arrayTwo.length) {
    const helper: string[] = [];
    // add missing items to helper array
    arrayTwo.forEach(item => {
      if (arrayOne.indexOf(item) === -1) {
        helper.push(item);
      }
    });
    // set deletionDiff to helper array
    parentDiffs = helper;
  } else {
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
  // this is the difference map to be returned
  const time = Date.now();

  // let localData: IterableIterator<IPrivateStructureObject> | false;

  const serverDataMap: PrivateStructureMap = new Map();
  const deletionMap: IDeletionMap = {};
  let isBothDataEqual: boolean = true;

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
    if (serverDataMap.has(tag)) {
      const { parentDiffs, isEqual } = calculateParentsToBeDeleted(
        //@ts-ignore
        serverDataMap.get(tag).parents,
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
      if (!isEqual) isBothDataEqual = false;
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

  // return diffs
  console.log("BENCHMARK", Date.now() - time);
  return {
    copyOfServerData: isBothDataEqual ? false : serverDataMap,
    deletionMap
  };
};
