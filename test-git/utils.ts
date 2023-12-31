import fs from "fs";
import { exec } from "child_process";
import { temporaryDirectory } from "tempy";

import Logger from "../src/util/logger";
import { ExecOptions } from "child_process";
import slugify from "slugify";

const gitTestLogger = new Logger("gitTest");
const shLogger = new Logger("sh");

export const GIT_URL = "http://localhost:8888";

export const execP = (command: string, options?: ExecOptions) =>
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

export const readFile = (path: string) => fs.promises.readFile(path, "utf-8");

const startGitServer = async (testDirectory: string) => {
  const env = {
    ...process.env,
    GIT_HTTP_MOCK_SERVER_PORT: "8888",
    GIT_HTTP_MOCK_SERVER_PERSIST_CHANGES: "yes",
    GIT_HTTP_MOCK_SERVER_ROOT: `${testDirectory}/server`,
  };
  //
  await execP(`yarn run git-http-mock-server start`, { env });

  // Wait for git-http-mock-server to start listening
  await new Promise((resolve) => setTimeout(resolve, 500));
};

export const setup = async () => {
  const testDirectory = temporaryDirectory();
  gitTestLogger.log("Test directory:", testDirectory);

  await startGitServer(testDirectory);

  // Prevent git from searching for repositories in parent directories. We don't want to accidentally mess
  // with the real repository. See https://git-scm.com/docs/git#Documentation/git.txt-codeGITCEILINGDIRECTORIEScode for details.
  process.env["GIT_CEILING_DIRECTORIES"] = testDirectory;

  // Change the current working directory to avoid accidentally calling git commands in the real repository
  process.chdir(testDirectory);

  // Prepare directories
  await execP(`mkdir source server test result`);

  return testDirectory;
};

export const tearDown = async (originalDirectory: string) => {
  process.chdir(originalDirectory);
  await execP(`yarn git-http-mock-server stop`);
};

export const setupTest = async (
  rootDirectory: string,
  fixturePath: string,
  testName: string
) => {
  const testDirectory = slugify(testName.toLowerCase());
  process.chdir(rootDirectory);
  await execP(
    `mkdir source/${testDirectory} server/${testDirectory} test/${testDirectory} result/${testDirectory}`
  );

  const hasFixture = await fs.promises
    .stat(`${fixturePath}/${testDirectory}`)
    .then(() => true)
    .catch(() => false);

  // Initialize source git repository
  await process.chdir(`source/${testDirectory}`);
  await execP(`git init`);
  if (hasFixture) {
    // Copy files into source repository
    await execP(`cp -r ${fixturePath}/${testDirectory}/* .`);
    await execP(`git add --all`);
    await execP(`git commit -m "Initial commit"`);
  } else {
    // TODO: Without creating an empty commit pushing from the test repository fails. I've got not idea why.
    await execP(`git commit -m "Empty commit" --allow-empty`);
  }

  process.chdir(rootDirectory);

  // Clone the source repository into a bare repository that is exposed via HTTP
  await execP(
    `git clone --bare source/${testDirectory} server/${testDirectory}`
  );

  return testDirectory;
};
