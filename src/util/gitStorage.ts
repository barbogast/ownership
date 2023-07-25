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
    const entityFolders = await load(fs, git, queryStore.config.name);
    store.import(info, entityFolders);
  }
};
/*
- create query: add file
- update query: edit file
- delete query
- create db: add file
- edit db: edit file    


update:
1. fetch()
2. rebase main on origin/main
    before pull: commit / reset
    after pull: 
    



Local draft state, synchronized via Yjs/webrtc
- how to invite users?

Local git state is synchronized via Yjs
- no, we cannot just do `git pull`

---------------------------------------------------------------------------------
User can enable Sync-mode: they will then enter a Yjs/webrtc room with all users 
in this repository.
- what if they have local changes?
- each repository contains a secrect key that is needed to join the room
    - the key is public for public repos and secret for private repos

Git is only used as archive, not for local state.
- To commit a change the repository is cloned, and the affected files are overriden.
    - If a conflict happens just try again

2 histories: git history and Yjs history
    - Yjs history is only relevant from most recent commit on. Changes before that can be dropped

For users in the room: when a git commit happens it will automatically be pulled and their 
Yjs state will be reset
- that works since their state was synced with that of the committing user, meaning we can replace
    their state with the one from git

For users which were not in the room when a commit happened: If they have a dirty local state:
- they can reset their local state
- they can commit their changes(?)
*/
