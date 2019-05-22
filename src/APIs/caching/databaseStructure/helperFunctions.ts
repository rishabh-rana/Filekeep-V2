import {
  IRawPrivateStructureObject,
  IPrivateStructureObject,
  PrivateStructureMap,
  ITagidToTagnameMap,
  IDeletionMap
} from "../../../modules/appTypes";

// this function compares two arrays and returns the  items that were missing from ArrayOne wrt Array two
const isArrayEqualWithDiffs = (
  arrayOne: string[],
  arrayTwo: string[]
): { a: boolean; b: string[] | null } => {
  //
  let deletionDiff: string[] | null = null;
  let isEqual = true;
  // if lengths are unequal, the arrays are unequal
  if (arrayOne.length !== arrayTwo.length) isEqual = false;
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
    deletionDiff = helper;
  } else {
    return {
      a: false,
      b: null
    };
  }
  // check equality of individual items
  arrayOne.forEach((data: string, index: number) => {
    if (data !== arrayTwo[index]) isEqual = false;
  });
  // return diffs and isEqual
  return { a: isEqual, b: deletionDiff };
};

// this method is same as above, but only returns if two array are equal or not
const isArrayEqual = (arrayOne: string[], arrayTwo: string[]): boolean => {
  let isEqual = true;

  if (arrayOne.length !== arrayTwo.length) return false;

  arrayOne.forEach((data: string, index: number) => {
    if (data !== arrayTwo[index]) isEqual = false;
  });

  return isEqual;
};

// main export function, this compares two data structures and returns a Map of differences between thetwo

export const returnDiffs = (
  serverData: IRawPrivateStructureObject[],
  localDataMap: PrivateStructureMap | null,
  tagIdToTagNameMap: ITagidToTagnameMap,
  requireDeletionDiff?: true
): { diffs: PrivateStructureMap; deletionMap: IDeletionMap } => {
  // this is the difference map to be returned
  const diffs: PrivateStructureMap = new Map();
  // this is the deletion map, this indicates that we need to delete the said tag or parents from the structure
  // this is introduces because we need to take a union of public and private structure's parents
  // and a union will result in no effect if a parent is deleted from the public structure
  let deletionMap: IDeletionMap = {};
  // this is the data from IDB
  let localData: IterableIterator<IPrivateStructureObject> | false;

  if (localDataMap) {
    localData = localDataMap.values();
  } else {
    localData = false;
  }

  // INITIAL SETUP DONE

  // this function will add the serverData Object with the tagName to the diffs Map
  // this is to be executed when an object on localData and serverData dont match
  const prepareDiff = (serverObject: IRawPrivateStructureObject): void => {
    diffs.set(serverObject.tag, {
      ...serverObject,
      tagName: tagIdToTagNameMap[serverObject.tag]
    });
  };
  // if serverMap has a smaller size, it implies some tags have been deleted
  // basically, some public resource has been made private by the admins
  if (localDataMap && serverData.length < localDataMap.size) {
    // pop the removed data from localdata and add deletion command
    const iterator = localDataMap.values();
    let currentIteration = iterator.next();

    let counter = 0;
    // this counts number of deletions in effect
    let numberOfDeletions = localDataMap.size - serverData.length;

    while (!currentIteration.done) {
      // if no more serverData exist, break loop, as serverData has less length than localData
      if (!serverData[counter]) {
        break;
      }
      const servertag = serverData[counter].tag;
      const localtag = currentIteration.value.tag;
      // if tags are unequal, delete the tag on localData
      // the order of the object are preserved in the app always so no mismatch wil occur unless deletion occur
      // in case of such a deletion, all the lower tags will shif one index up and serverData struct will match localData exactly

      // below, we are adding deletion command
      if (servertag !== localtag) {
        if (deletionMap[localtag]) {
          deletionMap[localtag].mainTag = localtag;
        } else {
          deletionMap[localtag] = {
            mainTag: localtag
          };
        }
        // delete this tag
        localDataMap.delete(currentIteration.value.tag);
        // count number of deletions
        numberOfDeletions--;
      }
      currentIteration = iterator.next();
      counter++;
    }
    // if number od deletions are not met, that menas that any remainign objects inside the
    // localData are to be deleted (as order is retained always)
    while (numberOfDeletions !== 0) {
      // simply execute above logic
      const localtag = currentIteration.value.tag;
      if (deletionMap[localtag]) {
        deletionMap[localtag].mainTag = localtag;
      } else {
        deletionMap[localtag] = {
          mainTag: localtag
        };
      }
      localDataMap.delete(localtag);
      numberOfDeletions--;
      currentIteration = iterator.next();
    }

    console.log(localDataMap);
  }
  // now either serverData is a biggerMap or equal size map
  serverData.forEach(serverObject => {
    // if no local data, it means fresh sync, just add all diffs
    if (!localData) {
      console.log("FRESH SYNC");
      prepareDiff(serverObject);
      return;
    }

    const localObject = localData.next().value;
    // this means serverData was bigger, add the remaining entries automatically
    if (!localObject) {
      console.log("LENGTH INCOMPATIBILITY");
      prepareDiff(serverObject);
      return;
    }
    // it means tags were unequal, rare cae this might happen, as we always add elements to bottom of array on server
    // still this ensures that on 2 executions of below, server and local are in perfect sync (tried)
    if (serverObject.tag !== localObject.tag) {
      console.log("UNEQUAL TAGS", serverObject.tag, localObject.tag);
      prepareDiff(serverObject);
      return;
    }
    // the code below compares parents if the tags were equal in both cases
    let isEqual: boolean;
    let deletionDiff: string[] | null;
    // if a deletion diff was requested, use the isArrayEqual which returns one
    if (requireDeletionDiff) {
      const { a, b } = isArrayEqualWithDiffs(
        serverObject.parents,
        localObject.parents
      );
      isEqual = a;
      deletionDiff = b;
    } else {
      isEqual = isArrayEqual(serverObject.parents, localObject.parents);
      deletionDiff = null;
    }
    // this means unuequal parents
    if (!isEqual) {
      console.log("UNEQUAL PARENTS");
      if (deletionDiff) {
        // add this entry to deletion map
        if (deletionMap[serverObject.tag]) {
          deletionMap[serverObject.tag].parents = deletionDiff;
        } else {
          deletionMap[serverObject.tag] = {
            parents: deletionDiff
          };
        }
      }
      prepareDiff(serverObject);
      return;
    }
  });
  // return diffs
  return { diffs, deletionMap };
};
