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

import { getHelpersNode, loadFromGit, saveToGit } from "../src/util/gitStorage";
import { Folder } from "../src/util/fsHelper";
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

const readFile = (path: string) => fs.promises.readFile(path, "utf-8");

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
  slugify(
    expect.getState().currentTestName!.split(" > ").at(-1)!.toLowerCase()
  );

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

  test("Save", async () => {
    const name = getTestSlug();

    const folder: Folder = {
      folders: {
        subfolderA: {
          files: {
            "file3.txt": "Hello World!",
          },
          folders: {},
        },
      },
      files: {
        "file1.csv": "col1,col1\n1,2",
        "file2.json": "{hello: 'world'}",
      },
    };

    const { fsHelper, gitHelper } = getHelpersNode({
      gitRoot: `${testDirectory}/test/${name}`,
      disableCorsProxy: true,
    });

    const url = `${GIT_URL}/${name}`;
    await gitHelper.clone(url);
    await saveToGit({ fsHelper, gitHelper }, url, folder);
    await gitHelper.commit();
    await gitHelper.push();

    await execP(`git clone ${GIT_URL}/${name}`, {
      cwd: `${testDirectory}/result`,
    });

    await expect(
      readFile(`${testDirectory}/result/${name}/file1.csv`)
    ).resolves.toBe("col1,col1\n1,2");
    await expect(
      readFile(`${testDirectory}/result/${name}/file2.json`)
    ).resolves.toBe("{hello: 'world'}");
    await expect(
      readFile(`${testDirectory}/result/${name}/subfolderA/file3.txt`)
    ).resolves.toBe("Hello World!");
  });

  test("Load", async () => {
    const name = getTestSlug();

    const expectedFolder: Folder = {
      folders: {
        subfolderA: {
          files: {
            "file3.txt": "Hello World!",
          },
          folders: {},
        },
      },
      files: {
        "file1.csv": "col1,col1\n1,2",
        "file2.json": "{hello: 'world'}",
      },
    };

    const { fsHelper, gitHelper } = getHelpersNode({
      gitRoot: `${testDirectory}/test/${name}`,
      disableCorsProxy: true,
    });

    const url = `${GIT_URL}/${name}`;
    await gitHelper.clone(url);
    const receivedFolder = await loadFromGit({ fsHelper, gitHelper }, url);

    expect(receivedFolder).toEqual(expectedFolder);
  });
});
