import {
  PrivateStructureMap,
  ITagidToTagnameMap,
  IDeletionMap,
  IServerPrivateStructureObject,
  IParentObject
} from "../../../modules/appTypes";

// this function compares two arrays and returns the  items that were missing from ArrayOne wrt Array two
const calculateParentsToBeDeleted = (
  objectOne: IParentObject,
  objectTwo: IParentObject
): { isEqual: boolean; parentDiffs: IParentObject | null } => {
  //
  let parentDiffs: IParentObject | null = null;
  let isEqual = true;
  // declare noth objects keys as arrays
  const arrayOne = Object.keys(objectOne);
  const arrayTwo = Object.keys(objectTwo);

  if (arrayOne.length < arrayTwo.length) {
    // check for deleted items and add to diffs
    const helper: IParentObject = {};
    arrayTwo.forEach(item => {
      if (objectOne[item] === undefined) helper[item] = true;
    });
    parentDiffs = helper;
    return {
      isEqual: false,
      parentDiffs
    };
  }
  // check for presence of all items
  arrayOne.forEach(item => {
    if (objectTwo[item] === undefined) isEqual = false;
  });

  // return diffs and isEqual
  return { isEqual, parentDiffs };
};

export const returnDiffs = (
  serverData: IServerPrivateStructureObject,
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

  Object.keys(serverData).forEach(tag => {
    if (localDataMap && !localDataMap.has(tag)) {
      isBothDataEqual = false;
    }
    serverDataMap.set(tag, {
      ...serverData[tag],
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

  localDataMap.forEach((localDoc, tag) => {
    let serverDoc = serverDataMap.get(tag);

    if (serverDoc) {
      const { parentDiffs, isEqual } = calculateParentsToBeDeleted(
        serverDoc.parents,
        localDoc.parents
      );
      if (parentDiffs) {
        deletionMap[tag] = {
          parents: parentDiffs
        };
        isBothDataEqual = false;
      }
      if (!isEqual) {
        isBothDataEqual = false;
      }
    } else {
      deletionMap[tag] = {
        mainTag: tag
      };
      // tells a tag was deleted
      isBothDataEqual = false;
    }
  });

  // return diffs
  return {
    copyOfServerData: isBothDataEqual ? false : serverDataMap,
    deletionMap
  };
};
