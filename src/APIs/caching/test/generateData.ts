import { PrivateStructureMap } from "../../../modules/appTypes";
import {
  addDatabaseStructureData,
  getDatabaseStructure
} from "../../indexedDb/databaseHeirarchyStructure";
import { syncPrivateStructure } from "../databaseStructure/syncPrivateStructure";
import { returnDiffs } from "../databaseStructure/helperFunctions";

const generateData = () => {
  const testMap: PrivateStructureMap = new Map();

  const bigParentsArray: string[] = [];
  for (var i = 0; i < 1000; i++) {
    bigParentsArray.push("parent" + i);
  }

  const registerTemplate = (tag: string) => {
    testMap.set(tag, {
      tag,
      tagName: tag + "name",
      parents: bigParentsArray
    });
  };
  for (var i = 0; i < 10000; i++) {
    registerTemplate(i.toString());
  }

  return testMap;
};

const generateData2 = () => {
  const testMap: any = [];

  const bigParentsArray: string[] = [];
  for (var i = 0; i < 1000; i++) {
    bigParentsArray.push("parent" + i);
  }

  const registerTemplate = (tag: string) => {
    testMap.push({
      tag,
      parents: bigParentsArray
    });
  };
  for (var i = 0; i < 500; i++) {
    registerTemplate(i.toString());
  }

  return testMap;
};

export const cacheData = async () => {
  const data = generateData();
  const time = Date.now();
  await addDatabaseStructureData({
    keyPath: "TRIAL_PATH",
    data: data
  });
  console.log("BIG DATA ENTRY TOOK:", Date.now() - time, " ms");
};

export const getData = async () => {
  const serverData = generateData2();
  const data = await getDatabaseStructure("TRIAL_PATH");
  const time = Date.now();

  if (!data) return;
  const {} = returnDiffs(serverData, data.data, {});
  console.log("TEST:", Date.now() - time);
};
