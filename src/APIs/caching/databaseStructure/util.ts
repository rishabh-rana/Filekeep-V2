import {
  IDatabaseStructure_INDEXEDDB,
  IDatabaseStructure_SERVER,
  IFuseIndex
} from "../../../typesAndConstants/appTypes";

const isArrayEqual = (arrayOne: string[], arrayTwo: string[]): boolean => {
  let isEqual = true;

  if (arrayOne.length !== arrayTwo.length) return false;

  arrayOne.forEach((data: string, index: number) => {
    if (data !== arrayTwo[index]) isEqual = false;
  });

  return isEqual;
};

export const isDataSame = (
  serverData: IDatabaseStructure_SERVER,
  localData: IDatabaseStructure_INDEXEDDB
): boolean => {
  let isSame: boolean = true;
  Object.keys(serverData).forEach(tag => {
    if (!localData.data[tag]) isSame = false;
    if (!isArrayEqual(serverData[tag], localData.data[tag])) isSame = false;
  });

  return isSame;
};

export const preparefuseindices = (
  data: IDatabaseStructure_SERVER
): IFuseIndex[] => {
  const unpackArray = (array: string[]): any => {
    const obj: any = {};
    array.forEach((tag: any) => {
      obj[tag] = true;
    });
    return obj;
  };

  let rootFuseIndices: any[] = [];

  Object.keys(data).forEach(tag => {
    rootFuseIndices.push({
      tag: tag,
      parents: unpackArray(data[tag])
    });
  });

  return rootFuseIndices;
};
