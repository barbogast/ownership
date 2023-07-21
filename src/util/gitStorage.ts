import useDatabaseDefinitionStore, {
  databaseDefinitionStore,
  databaseDefinitionStoreConfig,
} from "../databaseDefinitionStore";
import { StoreConfig } from "../nestedStores";
import useQueryStore, {
  queryStore,
  queryStoreConfig,
} from "../query/queryStore";
import { RepositoryInfo } from "../types";
import { FileContents } from "./fsHelper";
import FsHelper from "./fsHelper";
import GitHelper from "./gitHelpers";
import useReportStore, {
  reportStore,
  reportStoreConfig,
} from "../report/reportStore";

const save = async <
  Entity extends Record<"id" | string, unknown>,
  State extends Record<string, Entity>
>(
  fsHelper: FsHelper,
  gitHelper: GitHelper,
  data: Record<string, Entity>,
  config: StoreConfig<Entity, State>
) => {
  for (const entity of Object.values(data)) {
    const folder = `${config.name}/${entity.id}`;
    await fsHelper.mkdir_p(`${gitHelper.root}/${folder}`);

    const files = config.entityToFiles(entity);
    await fsHelper.writeFilesToDirectory(`${gitHelper.root}/${folder}`, files);
    await gitHelper.addFiles(folder, Object.keys(files));
  }
};

const load = async <
  Entity extends Record<"id" | string, unknown>,
  State extends Record<string, Entity>,
  Files extends string
>(
  fsHelper: FsHelper,
  gitHelper: GitHelper,
  config: StoreConfig<Entity, State, Files>
) => {
  const directory = `${gitHelper.root}/${config.name}`;
  const gitRootEntries = await fsHelper.fs.promises.readdir(gitHelper.root);
  if (!gitRootEntries.includes(config.name)) {
    return [];
  }
  const entries = await fsHelper.fs.promises.readdir(directory);
  const entities = [];
  for (const entry of entries) {
    const path = `${directory}/${entry}`;
    const stat = await fsHelper.fs.promises.stat(path);
    if (stat.isDirectory()) {
      const contents = await fsHelper.readFilesInDirectory<FileContents<Files>>(
        path
      );
      const entity = await config.filesToEntity(contents);
      entities.push(entity);
    } else {
      console.error(path, "is not a directory");
    }
  }

  return entities;
};

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

  await save(fsHelper, gitHelper, useQueryStore.getState(), queryStoreConfig);
  await save(
    fsHelper,
    gitHelper,
    useDatabaseDefinitionStore.getState(),
    databaseDefinitionStoreConfig
  );
  await save(fsHelper, gitHelper, useReportStore.getState(), reportStoreConfig);

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

  const queries = await load(fs, git, queryStoreConfig);
  const dbs = await load(fs, git, databaseDefinitionStoreConfig);
  const reports = await load(fs, git, reportStoreConfig);
  queryStore.import(info, queries);
  databaseDefinitionStore.import(info, dbs);
  reportStore.import(info, reports);
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
