import { updateAndCacheFuseIndices } from "./databaseStructure/cacheRootHeirarchy";
import { updateAndCacheSharedFuseIndices } from "./databaseStructure/cacheSharedChannels";

export const handleDatabaseHeirarchyStructureCaching = async (): Promise<
  void
> => {
  updateAndCacheFuseIndices();
  updateAndCacheSharedFuseIndices();
};
