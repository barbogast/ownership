import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import LightningFS from "@isomorphic-git/lightning-fs";
import stringify from "safe-stable-stringify";

import { deepCopy, logger } from "./utils";
import useQueryStore from "./query/queryStore";
import { GH_TOKEN } from "./secrets";

const fs = new LightningFS("fs");

const onAuth = () => {
  return {
    username: "barbogast",
    password: GH_TOKEN,
  };
};

const author = {
  name: "Mr. Test",
  email: "mrtest@example.com",
};

const mkdir_p = async (path: string) => {
  let fullPath = "";
  for (const segment of path.split("/").filter(Boolean)) {
    fullPath += "/" + segment;
    try {
      await fs.promises.stat(fullPath);
      logger("git", "mkdir_p exists", { fullPath });
    } catch (err) {
      if ((err as { code: string }).code === "ENOENT") {
        logger("git", "mkdir", { fullPath });
        await fs.promises.mkdir(fullPath);
      }
    }
  }
};

const writeAndAddFile = async (
  gitRoot: string,
  folder: string,
  filename: string,
  content: string
) => {
  const filepath = `${folder}/${filename}`;
  logger("git", "writeAndAddFile", { gitRoot, filepath });
  await fs.promises.writeFile(`${gitRoot}/${filepath}`, content);
  await git.add({ fs, dir: gitRoot, filepath });
};

const saveQueryToGit = async (gitRoot: string, queryId: string) => {
  const folder = `queries/${queryId}`;
  await mkdir_p(`${gitRoot}/${folder}`);

  const query = deepCopy(useQueryStore.getState().queries[queryId]);

  const sqlStatement = query.sqlStatement;
  if (sqlStatement) {
    query.sqlStatement = "";
  }

  const transformCode = query.transformCode;
  if (transformCode) {
    query.transformCode = "";
  }

  await writeAndAddFile(
    gitRoot,
    folder,
    "index.json",
    stringify(query, null, 2)
  );
  await writeAndAddFile(gitRoot, folder, "sqlStatement.sql", sqlStatement);
  await writeAndAddFile(gitRoot, folder, "transformCode.ts", transformCode);

  await git.commit({
    fs,
    dir: gitRoot,
    message: "Change file",
    author,
  });
  await git.push({ fs, dir: gitRoot, http, onAuth });
};

export const f = async () => {
  // await git.clone({
  //   fs,
  //   http,
  //   dir,
  //   url: "https://github.com/barbogast/ownership-test-repo",
  //   corsProxy: "https://cors.isomorphic-git.org",
  //   onAuth,
  // });
  // const log = await git.log({
  //   fs,
  //   dir,
  // });
  // console.log(log);

  // const fileContent = await fs.promises.readFile(
  //   "/test-clone1/README.md",
  //   "utf8"
  // );

  // await fs.promises.writeFile(
  //   "/test-clone1/README.md",
  //   `${fileContent}\n${new Date().toISOString()}`
  // );
  // await git.add({ fs, dir: "/test-clone1", filepath: "README.md" });
  // await git.commit({
  //   fs,
  //   dir: "/test-clone1",
  //   message: "Change file",
  //   author,
  // });
  // await git.push({ fs, dir: "/test-clone1", http, onAuth });
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

  saveQueryToGit("/test-clone1", "1856df95-2c75-4245-84a3-1d4bd23b9f2b").catch(
    console.error
  );
};
