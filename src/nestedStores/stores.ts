import { databaseDefinitionStore } from "../databaseDefinition/databaseDefinitionStore";
import { queryStore } from "../query/queryStore";
import { reportStore } from "../report/reportStore";
import { Repository } from "../repository/repositoryStore";
import { Folder, mergeFolders } from "../util/fsHelper";

const stores = [queryStore, databaseDefinitionStore, reportStore];

export default stores;

export const exportStoresToFolder = () =>
  stores.reduce(
    (rootFolder, store) => mergeFolders(rootFolder, store.export()),
    { files: {}, folders: {} }
  );

export const importStoresFromFolder = async (
  repository: Repository,
  folder: Folder
) => {
  for (const store of stores) {
    await store.import(repository.id, folder);
  }
};
