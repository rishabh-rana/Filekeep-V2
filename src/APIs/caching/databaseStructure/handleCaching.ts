import { syncPrivateStructure } from "./handleCaching/syncPrivateStructure";
import { syncPublicStructure } from "./handleCaching/syncPublicStructure";

export const handleCachingStructure = async () => {
  const unsubscribePrivate = await syncPrivateStructure();
  const unsubscribePublic = await syncPublicStructure();
  return [unsubscribePrivate, unsubscribePublic];
};
