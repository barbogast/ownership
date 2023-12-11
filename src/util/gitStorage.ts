import http from "isomorphic-git/http/web";
import LightningFS from "@isomorphic-git/lightning-fs";
import stores from "../nestedStores/stores";
import { RepositoryInfo } from "../types";
import FsHelper, { FileContents } from "./fsHelper";
import GitHelper from "./gitHelpers";

// @ts-expect-error https://github.com/isomorphic-git/lightning-fs/commit/76dc7ac318ec79ea7e9c770df78e2ed6ff0306e6
const fsOptions: LightningFS.Options = { wipe: true };

export const getHelpersBrowser = (info: RepositoryInfo) => {
  const fs = new LightningFS(info.organization, fsOptions);
  const fsHelper = new FsHelper(fs);
  const gitHelper = new GitHelper(fs, http, "/" + info.path);
  return { fsHelper, gitHelper };
};

export const getHelpersNode = (gitRoot: string) => {
  const fsHelper = new FsHelper(fs);
  const gitHelper = new GitHelper(fs, http, gitRoot);
  return { fsHelper, gitHelper };
};

const getEntryFolderPath = (gitRoot: string, entryName: string) =>
  `${gitRoot}/${entryName}`;

const getRelativeEntryPath = (entryName: string, entryId: string) =>
  `${entryName}/${entryId}`;

const getEntryPath = (gitRoot: string, entryName: string, entryId: string) =>
  `${gitRoot}/${entryName}/${entryId}`;

export const save = async (
  fsHelper: FsHelper,
  gitHelper: GitHelper,
  entryName: string,
  entityFolders: Record<string, FileContents<string>>
) => {
  for (const [id, files] of Object.entries(entityFolders)) {
    const folder = getEntryPath(gitHelper.root, entryName, id);
    await fsHelper.mkdir_p(folder);
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

export const saveToGit = async (
  helpers: { fsHelper: FsHelper; gitHelper: GitHelper },
  repositoryInfo: RepositoryInfo,
  username: string,
  password: string
) => {
  const { fsHelper, gitHelper } = helpers; // const gitRoot = "/" + repository;
  await gitHelper.cloneFromGithub(repositoryInfo.path, username, password);

  for (const store of stores) {
    await save(fsHelper, gitHelper, store.config.name, store.export());
  }

  await gitHelper.commit();
  await gitHelper.push(username, password);
};

export const loadFromGit = async (
  helpers: { fsHelper: FsHelper; gitHelper: GitHelper },
  info: RepositoryInfo,
  username: string,
  password: string
) => {
  const { fsHelper, gitHelper } = helpers;
  await gitHelper.cloneFromGithub(gitHelper.root, username, password);

  for (const store of stores) {
    const entityFolders = await load(fsHelper, gitHelper, store.config.name);
    await store.import(info, entityFolders);
  }
};
