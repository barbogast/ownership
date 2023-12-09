import fs from "fs";
import { ExecOptions, exec } from "child_process";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { temporaryDirectory } from "tempy";
import http from "isomorphic-git/http/node";

import { save } from "../src/util/gitStorage";
import FsHelper, { FileContents } from "../src/util/fsHelper";
import GitHelper from "../src/util/gitHelpers";
import Logger from "../src/util/logger";
import { resolve } from "path";
import slugify from "slugify";

Logger.enable("fs", "git", "gitTest", "sh");
const gitTestLogger = new Logger("gitTest");
const shLogger = new Logger("sh");

const GIT_URL = "http://localhost:8888";

const execP = (command: string, options?: ExecOptions) =>
  new Promise((resolve, reject) => {
    const start = performance.now();
    return exec(command, options, (err, stdout) => {
      shLogger.log(
        `${options?.cwd ? options.cwd + ":" : ""} ${command} (${Math.round(
          performance.now() - start
        )} ms)`
      );

      if (err) {
        console.error(stdout);
        console.error(err);
      }
      return err ? reject(err) : resolve(stdout);
    });
  });

const startGitServer = async (testDirectory: string) => {
  const env = {
    ...process.env,
    GIT_HTTP_MOCK_SERVER_PORT: "8888",
    GIT_HTTP_MOCK_SERVER_PERSIST_CHANGES: "yes",
    GIT_HTTP_MOCK_SERVER_ROOT: `${testDirectory}/server`,
  };
  await execP(`git-http-mock-server start`, { env });

  // Wait for git-http-mock-server to start listening
  await new Promise((resolve) => setTimeout(resolve, 500));
};

const getTestSlug = () =>
  slugify(expect.getState().currentTestName!.split(" > ").at(-1)!);

const compareResult = async (
  root: string,
  testName: string,
  folders: Record<string, FileContents<string>>
) => {
  for (const [folder, files] of Object.entries(folders)) {
    const directory = `${root}/result/${testName}/query/${folder}`;
    for (const [filename, content] of Object.entries(files)) {
      const path = `${directory}/${filename}`;
      const actual = await fs.promises.readFile(path, "utf-8");
      expect(actual).toBe(content);
    }

    const directoryContents = await fs.promises.readdir(directory);
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
    - <temp-folder>/source: Temporary repositories used to set up the bare repository ahead of the test
    - <temp-folder>/server: Bare repositories exposed by the server
    - <temp-folder>/test: Working repository of the code that is tested
    - <temp-folder>/result: Clones of the bare repositories created after the test ran to verify the result

    Note: I did try to expose a normal repository by the server (instead of a bare one). This would
    have allowed to skip the source and the result repositories. However, a normal repository would not 
    conistently update its files when being pushed to.
*/
describe("Test git", () => {
  const originalDirectory = process.cwd();
  let testDirectory: string;
  const fixturePath = resolve(__dirname, "fixtures");

  // Create shared test directories and start git-http-mock-server
  beforeAll(async () => {
    testDirectory = temporaryDirectory();
    gitTestLogger.log("Test directory:", testDirectory);

    // Prevent git from searching for repositories in parent directories. We don't want to accidentally mess
    // with the real repository. See https://git-scm.com/docs/git#Documentation/git.txt-codeGITCEILINGDIRECTORIEScode for details.
    process.env["GIT_CEILING_DIRECTORIES"] = testDirectory;

    // Change the current working directory to avoid accidentally calling git commands in the real repository
    process.chdir(testDirectory);

    // Prepare directories
    await execP(`mkdir source server test result`);

    await startGitServer(testDirectory);
  });

  afterAll(async () => {
    await execP(`git-http-mock-server stop`);
    process.chdir(originalDirectory);
  });

  // Create test directories for test case and initialize the bare repository
  beforeEach(async () => {
    const testName = getTestSlug();

    process.chdir(testDirectory);
    await execP(
      `mkdir source/${testName} server/${testName} test/${testName} result/${testName}`
    );

    // Copy files into source repository
    const hasFixture = await fs.promises
      .stat(`${fixturePath}/${testName}`)
      .then(() => true)
      .catch(() => false);

    // Initialize source git repository
    await process.chdir(`source/${testName}`);
    await execP(`git init`);
    if (hasFixture) {
      await execP(`cp -r ${fixturePath}/${testName}/* .`);
      await execP(`git add --all`);
      await execP(`git commit -m "Initial commit"`);
    } else {
      // TODO: Without creating an empty commit pushing from the test repository fails. I've got not idea why.
      await execP(`git commit -m "Empty commit" --allow-empty`);
    }

    process.chdir(testDirectory);

    // Clone the source repository into a bare repository that is exposed via HTTP
    await execP(`git clone --bare source/${testName} server/${testName}`);
  });

  test("test 4", async () => {
    const name = getTestSlug();

    const folders = {
      queryA: {
        "index.json": '{"name": "queryA"}',
        "sqlStatement.sql": "SELECT * FROM tableA",
      },
      queryB: {
        "index.json": '{"name": "queryB"}',
      },
    };

    const fsHelper = new FsHelper(fs);
    const gitHelper = new GitHelper(fs, http, `${testDirectory}/test/${name}`);

    await gitHelper.clone(`${GIT_URL}/${name}`);
    await save(fsHelper, gitHelper, "query", folders);
    await gitHelper.commit();
    await gitHelper.push("asdf", "asdf");

    await execP(`git clone ${GIT_URL}/${name}`, {
      cwd: `${testDirectory}/result`,
    });
    await compareResult(testDirectory, name, folders);
  });
});
