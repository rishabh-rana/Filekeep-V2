import { syncPrivateStructure } from "./syncPrivateStructure";
import { syncPublicStructure } from "./syncPublicStructure";

export const handleCachingStructure = async () => {
  const unsubscribePrivate = await syncPrivateStructure();
  const unsubscribePublic = await syncPublicStructure();
  return [unsubscribePrivate, unsubscribePublic];
};
