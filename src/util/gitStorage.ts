import useQueryStore, {
  Query,
  filesToQuery,
  queryToFiles,
} from "../query/queryStore";
import FsHelper from "./fsHelper";
import GitHelper from "./gitHelpers";

const addQuery = async (
  fsHelper: FsHelper,
  gitHelper: GitHelper,
  query: Query
) => {
  const folder = `queries/${query.id}`;
  await fsHelper.mkdir_p(`${gitHelper.root}/${folder}`);

  const fileContents = queryToFiles(query);
  await fsHelper.writeFilesToDirectory(
    gitHelper.root + "/" + folder,
    fileContents
  );
  await gitHelper.addFiles(folder, Object.keys(fileContents));
};

const loadQuery = async (fs: FsHelper, directory: string) => {
  const contents = await fs.readFilesInDirectory(directory);
  const query = filesToQuery(contents);
  return query;
};

export const saveToGit = async (repositoryPath: string) => {
  const [organization, repository] = repositoryPath.split("/");
  const gitRoot = "/" + repository;

  const fsHelper = new FsHelper(organization);
  const gitHelper = new GitHelper(fsHelper.fs, gitRoot);
  await gitHelper.clone(repositoryPath);

  for (const query of Object.values(useQueryStore.getState().queries)) {
    await addQuery(fsHelper, gitHelper, query);
  }

  await gitHelper.commit();
  await gitHelper.push();
};

export const loadFromGit = async (repositoryPath: string) => {
  const [organization, repository] = repositoryPath.split("/");
  const gitRoot = "/" + repository;

  const fs = new FsHelper(organization);
  const git = new GitHelper(fs.fs, gitRoot);
  await git.clone(repositoryPath);

  const entries = await fs.fs.promises.readdir(gitRoot + "/queries");
  const queries = [];
  for (const entry of entries) {
    const path = gitRoot + "/queries/" + entry;
    const stat = await fs.fs.promises.stat(path);
    if (stat.isDirectory()) {
      const query = await loadQuery(fs, path);
      queries.push(query);
    } else {
      console.error(path, "is not a directory");
    }
  }

  return queries;
  //   console.log(queries);
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
