import fs_ from "fs";
import { describe, expect, test } from "vitest";

import { exec as exec_ } from "node:child_process";
import { saveStore } from "../src/util/gitStorage";
import FsHelper, { FileContents } from "../src/util/fsHelper";
import GitHelper from "../src/util/gitHelpers";
import Logger from "../src/util/logger";

const fs = fs_.promises;

const gitTestLogger = new Logger("gitTest");
const shLogger = new Logger("sh");

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

const prepareTest = gitTestLogger.time("prepareTest", async (name: string) => {
  await exec(`rm -rf test-git/temp`);
  await exec(`mkdir -p test-git/temp/source/${name}`);
  await exec(`mkdir -p test-git/temp/server/${name}`);
  await exec(`mkdir -p test-git/temp/test/${name}`);
  await exec(`mkdir -p test-git/temp/result/${name}`);

  // 1. Initialize bare repository
  await exec(`git init --bare`, `test-git/temp/server/${name}`);

  // 2. Initialize source repository: test-git/temp/source/<test-name>: git init
  await exec(
    `git clone http://localhost:8174/${name}`,
    `test-git/temp/source/${name}`
  );

  // 3. Copy files into source repository
  await exec(`cp -r test-git/fixtures/test2/* test-git/temp/source/${name}`);

  // 4. Add all files to git and commit: test-git/temp/source/<test-name>: git add . && git commit -m "Initial commit"
  await exec(`git add --all`, "test-git/temp/source/test2");
  await exec(`git commit -m "Initial commit"`, `test-git/temp/source/${name}`);
  await exec(`git push`, `test-git/temp/source/${name}`);
});

const compareResult = async (
  testName: string,
  folders: Record<string, FileContents<string>>
) => {
  for (const [folder, files] of Object.entries(folders)) {
    const directory = `test-git/temp/result/${testName}/query/${folder}`;
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
  test("test 1", async () => {
    Logger.enable("fs", "git", "sh", "gitTest");
    const organization = "org1";
    const repository = "repo1";
    const gitRoot = "test-dir" + repository;

    const fsHelper = new FsHelper(organization);
    const gitHelper = new GitHelper(fsHelper.fs, gitRoot);

    const folders = {
      queryA: {
        "index.json": '{"name": "queryA"}',
        "sqlStatement.sql": "SELECT * FROM tableA",
      },
      queryD: {
        "index.json": '{"name": "queryB"}',
      },
    };
    await exec(`rm -rf xxx`);
    await gitHelper.clone2(`http://localhost:8174/${gitRoot}`, "asdf", "asdf");
    await saveStore(fsHelper, gitHelper, "query", folders);
    await gitHelper.commit();
    await gitHelper.push("asdf", "asdf");
    await exec(`git clone http://localhost:8174/${gitRoot} xxx`);
  });

  test.only("test 2", async () => {
    Logger.enable("fs", "git", "gitTest", "sh");
    const name = "test2";
    await prepareTest(name);

    // 5. Run the test

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
    const gitHelper = new GitHelper(fsHelper.fs, `temp/test/${name}`);

    await gitHelper.clone2(`http://localhost:8174/${name}`, "asdf", "asdf");
    await saveStore(fsHelper, gitHelper, "query", folders);
    await gitHelper.commit();
    await gitHelper.push("asdf", "asdf");

    // Verify the repository
    // 6. Clone the repository to test-git/temp/result: git clone http://localhost:8174/<test-name>
    await exec(
      `git clone http://localhost:8174/${name}`,
      `test-git/temp/result`
    );

    await compareResult(name, folders);

    // 7. Compare test-git/temp/result/<test-name> to the expected files
  });
});
