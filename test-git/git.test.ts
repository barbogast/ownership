import fs_ from "fs";
import { describe, expect, test } from "vitest";
import { temporaryDirectory } from "tempy";

import { exec as exec_ } from "node:child_process";
import { saveStore } from "../src/util/gitStorage";
import FsHelper, { FileContents } from "../src/util/fsHelper";
import GitHelper from "../src/util/gitHelpers";
import Logger from "../src/util/logger";
import { beforeEach } from "node:test";

const fs = fs_.promises;

const gitTestLogger = new Logger("gitTest");
const shLogger = new Logger("sh");

const GIT_URL = "http://localhost:8174";

const exec = (command: string, cwd?: string) =>
  new Promise((resolve, reject) => {
    const start = performance.now();
    return exec_(command, { cwd }, (err, stdout) => {
      shLogger.log(
        `${cwd ? cwd + ":" : ""} ${command} (${Math.round(
          performance.now() - start
        )} ms)`
      );

      if (err) {
        console.error(err);
      }
      return err ? reject(err) : resolve(stdout);
    });
  });

const prepareTest = gitTestLogger.time(
  "prepareTest",
  async (root: string, name: string) => {
    await exec(`mkdir -p ${root}/source/${name}`);
    await exec(`mkdir -p ${root}/server/${name}`);
    await exec(`mkdir -p ${root}/test/${name}`);
    await exec(`mkdir -p ${root}/result/${name}`);

    // 1. Copy files into source repository
    await exec(`cp -r test-git/fixtures/${name}/* ${root}/source/${name}`);

    // 2. Initialize source git repository
    await exec(`git init`, `${root}/source/${name}`);
    await exec(`git add --all`, `${root}/source/${name}`);
    await exec(`git commit -m "Initial commit"`, `${root}/source/${name}`);

    // 3. Clone the source repository into a bare repository that is exposed via HTTP
    await exec(`git clone --bare source/${name} server/${name}`, root);
  }
);

const compareResult = async (
  root: string,
  testName: string,
  folders: Record<string, FileContents<string>>
) => {
  for (const [folder, files] of Object.entries(folders)) {
    const directory = `${root}/result/${testName}/query/${folder}`;
    for (const [filename, content] of Object.entries(files)) {
      const path = `${directory}/${filename}`;
      const actual = await fs.readFile(path, "utf-8");
      expect(actual).toBe(content);
    }

    const directoryContents = await fs.readdir(directory);
    for (const filename of directoryContents) {
      if (!(filename in files)) {
        throw new Error(`File ${filename} should not exist`);
      }
    }
  }
};
/*
    Folders:
    - test-git/fixtures: contains initial files of repositories
    - test-git/temp/source: Temporary repositories used to set up the bare repository ahead of the test
    - test-git/temp/bare: Bare repositories exposed by the server
    - test-git/temp/server: Working repository of the code that is tested
    - test-git/temp/result: Clones of the bare repositories created after the test ran to verify the result

    Note: I did try to expose a normal repository by the server (instead of a bare one). This would
    have allowed to skip the source and the result repositories. However, a normal repository would not 
    conistently update its files when being pushed to.

    Steps:

    Prepare the repository
    1. Initialize bare repository: test-git/temp/bare/<test-name>: git init --bare
    2. Initialize source repository: test-git/temp/source/<test-name>: git init
    3. Copy files into source repository: cp -r test-git/fixtures/<test-name>/* test-git/source/<test-name>
    4. Add all files to git and commit: test-git/temp/source/<test-name>: git add . && git commit -m "Initial commit"

    5. Run the test

    Verify the repository
    6. Clone the repository to test-git/temp/result: git clone http://localhost:8174/<test-name>
    7. Compare test-git/temp/result/<test-name> to the expected files


*/
describe("Test git", () => {
  let root: string;
  beforeEach(() => {
    root = temporaryDirectory();
  });

  test("test 2", async () => {
    Logger.enable("fs", "git", "gitTest", "sh");
    const name = "test2";
    await prepareTest(root, name);

    const folders = {
      queryA: {
        "index.json": '{"name": "queryA"}',
        "sqlStatement.sql": "SELECT * FROM tableA",
      },
      queryB: {
        "index.json": '{"name": "queryB"}',
      },
    };

    const organization = "org1";

    const fsHelper = new FsHelper(organization);
    const gitHelper = new GitHelper(fsHelper.fs, `${root}/test/${name}`);

    await gitHelper.clone2(`${GIT_URL}/${name}`);
    await saveStore(fsHelper, gitHelper, "query", folders);
    await gitHelper.commit();
    await gitHelper.push("asdf", "asdf");

    // 6. Clone the repository to test-git/temp/result: git clone http://localhost:8174/<test-name>
    await exec(`git clone ${GIT_URL}/${name}`, `${root}/result`);

    // 7. Compare test-git/temp/result/<test-name> to the expected files
    await compareResult(root, name, folders);
  });
});
