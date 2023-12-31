import child_proess from "child_process";
import nodeUtil from "util";
import { temporaryDirectory } from "tempy";
import { test } from "./fixtures";

const exec = nodeUtil.promisify(child_proess.exec);

let testDirectory: string;
let originalDirectory: string;
test.beforeAll(async () => {
  originalDirectory = process.cwd();
  testDirectory = temporaryDirectory();
  const env = {
    ...process.env,
    GIT_HTTP_MOCK_SERVER_PORT: "8888",
    GIT_HTTP_MOCK_SERVER_PERSIST_CHANGES: "yes",
    GIT_HTTP_MOCK_SERVER_ROOT: `${testDirectory}/server`,
  };
  await exec(`yarn git-http-mock-server start`, { env });
  process.chdir(testDirectory);
  await exec(`mkdir -p server/saving`);
  await exec(`(cd server/saving; git init)`);
});

test.afterAll(async () => {
  process.chdir(originalDirectory);
  await exec(`yarn git-http-mock-server stop`);
});

const projectName = "project1";

test.beforeEach(async ({ projectStorage }) => {
  await projectStorage.addProject(projectName);
});

// test("loading", async ({ page, mainPage }) => {
//   await page.goto(`/${projectName}`);
//   await mainPage.clickLoad();
// });

test("saving", async ({ page, mainPage, gitModal }) => {
  await page.goto(`/${projectName}`);
  await mainPage.clickSave();
  await gitModal.fillForm("http://localhost:8888/saving", "", "");
  await gitModal.clickSave();
});
