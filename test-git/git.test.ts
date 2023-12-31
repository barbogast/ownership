import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

import { getHelpersNode, loadFromGit, saveToGit } from "../src/util/gitStorage";
import { Folder } from "../src/util/fsHelper";
import Logger from "../src/util/logger";
import { resolve } from "path";
import { GIT_URL, execP, readFile, setup, setupTest, tearDown } from "./utils";

Logger.enable("fs", "git", "gitTest", "sh");

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
  let rootDirectory: string;
  let testDirectory: string;
  const fixturePath = resolve(__dirname, "fixtures");

  // Create shared test directories and start git-http-mock-server
  beforeAll(async () => {
    rootDirectory = await setup();
  });

  afterAll(async () => {
    await tearDown(originalDirectory);
  });

  // Create test directories for test case and initialize the bare repository
  beforeEach(async () => {
    const testName = expect.getState().currentTestName!.split(" > ").at(-1)!;
    testDirectory = await setupTest(rootDirectory, fixturePath, testName);
  });

  test("Save", async () => {
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
      gitRoot: `${rootDirectory}/test/${testDirectory}`,
      disableCorsProxy: true,
    });

    const url = `${GIT_URL}/${testDirectory}`;
    await gitHelper.clone(url);
    await saveToGit({ fsHelper, gitHelper }, url, folder);
    await gitHelper.commit();
    await gitHelper.push();

    await execP(`git clone ${GIT_URL}/${testDirectory}`, {
      cwd: `${rootDirectory}/result`,
    });

    await expect(
      readFile(`${rootDirectory}/result/${testDirectory}/file1.csv`)
    ).resolves.toBe("col1,col1\n1,2");
    await expect(
      readFile(`${rootDirectory}/result/${testDirectory}/file2.json`)
    ).resolves.toBe("{hello: 'world'}");
    await expect(
      readFile(`${rootDirectory}/result/${testDirectory}/subfolderA/file3.txt`)
    ).resolves.toBe("Hello World!");
  });

  test("Load", async () => {
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
      gitRoot: `${rootDirectory}/test/${testDirectory}`,
      disableCorsProxy: true,
    });

    const url = `${GIT_URL}/${testDirectory}`;
    await gitHelper.clone(url);
    const receivedFolder = await loadFromGit({ fsHelper, gitHelper }, url);

    expect(receivedFolder).toEqual(expectedFolder);
  });
});
