import { syncPrivateStructure } from "./syncPrivateStructure";
import { syncPublicStructure } from "./syncPublicStructure";

export const handleCachingStructure = async () => {
  await syncPrivateStructure();
  syncPublicStructure();
};
