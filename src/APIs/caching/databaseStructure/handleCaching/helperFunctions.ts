import {
  PrivateStructureMap,
  ITagidToTagnameMap,
  IChangeMap,
  IServerPrivateStructureObject
} from "../../../../modules/appTypes";

export const returnDiffs = (
  serverData: IServerPrivateStructureObject,
  localDataMap: PrivateStructureMap | false,
  tagIdToTagNameMap: ITagidToTagnameMap
): {
  copyOfServerData: PrivateStructureMap | false;
  changeMap: IChangeMap;
} => {
  const serverDataMap: PrivateStructureMap = new Map();
  // this is the difference map to be returned
  const changeMap: IChangeMap = {
    deletions: [],
    insertions: {}
  };
  let isBothDataEqual: boolean = true;

  Object.keys(serverData).forEach(tag => {
    if (localDataMap && !localDataMap.has(tag)) {
      isBothDataEqual = false;
      // handle insertion
      changeMap.insertions[tag] = serverData[tag];
    }
    serverDataMap.set(tag, {
      parent: serverData[tag],
      tagName: tagIdToTagNameMap[tag]
    });
  });

  // return the new map if no local data was there, with insertion being the entire serverData object
  if (!localDataMap) {
    return {
      copyOfServerData: serverDataMap,
      changeMap: {
        deletions: [],
        insertions: serverData
      }
    };
  }

  localDataMap.forEach((localDoc, tag) => {
    if (serverData[tag] === undefined) {
      // handle deletion
      changeMap.deletions.push(tag);
      isBothDataEqual = false;
    }
  });

  // return diffs
  return {
    copyOfServerData: isBothDataEqual ? false : serverDataMap,
    changeMap
  };
};
