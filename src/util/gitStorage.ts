import { databaseDefinitionStore } from "../databaseDefinitionStore";
import { queryStore } from "../query/queryStore";
import { RepositoryInfo } from "../types";
import FsHelper, { FileContents } from "./fsHelper";
import GitHelper from "./gitHelpers";
import { reportStore } from "../report/reportStore";

const getEntryFolderPath = (gitRoot: string, entryName: string) =>
  `${gitRoot}/${entryName}`;

const getRelativeEntryPath = (entryName: string, entryId: string) =>
  `${entryName}/${entryId}`;

const getEntryPath = (gitRoot: string, entryName: string, entryId: string) =>
  `${gitRoot}/${entryName}/${entryId}`;

const save = async (
  fsHelper: FsHelper,
  gitHelper: GitHelper,
  entryName: string,
  entityFolders: Record<string, FileContents<string>>
) => {
  for (const [id, files] of Object.entries(entityFolders)) {
    const folder = getEntryPath(gitHelper.root, entryName, id);
    await fsHelper.mkdir_p(folder);
    console.log(files);
    await fsHelper.writeFilesToDirectory(folder, files);
    await gitHelper.addFiles(
      getRelativeEntryPath(entryName, id),
      Object.keys(files)
    );
  }
};

const load = async (
  fsHelper: FsHelper,
  gitHelper: GitHelper,
  folder: string
) => {
  const gitRootEntries = await fsHelper.fs.promises.readdir(gitHelper.root);
  if (!gitRootEntries.includes(folder)) {
    return [];
  }
  const directory = getEntryFolderPath(gitHelper.root, folder);
  const entries = await fsHelper.fs.promises.readdir(directory);
  const folders = [];
  for (const entry of entries) {
    const path = getEntryPath(gitHelper.root, folder, entry);
    const stat = await fsHelper.fs.promises.stat(path);
    if (stat.isDirectory()) {
      const contents = await fsHelper.readFilesInDirectory(path);
      folders.push(contents);
    } else {
      console.error(path, "is not a directory");
    }
  }

  return folders;
};

const stores = [queryStore, databaseDefinitionStore, reportStore];

export const saveToGit = async (
  repositoryInfo: RepositoryInfo,
  username: string,
  password: string
) => {
  const { organization, repository } = repositoryInfo;
  const gitRoot = "/" + repository;

  const fsHelper = new FsHelper(organization);
  const gitHelper = new GitHelper(fsHelper.fs, gitRoot);
  await gitHelper.clone(repositoryInfo.path, username, password);

  for (const store of stores) {
    await save(fsHelper, gitHelper, store.config.name, store.export());
  }

  await gitHelper.commit();
  await gitHelper.push(username, password);
};

export const loadFromGit = async (
  info: RepositoryInfo,
  username: string,
  password: string
) => {
  const { organization, path } = info;
  const gitRoot = "/" + path;

  const fs = new FsHelper(organization);
  const git = new GitHelper(fs.fs, gitRoot);
  await git.clone(gitRoot, username, password);

  for (const store of stores) {
    const entityFolders = await load(fs, git, store.config.name);
    store.import(info, entityFolders);
  }
};
