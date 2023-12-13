import { test, expect } from "./fixtures";

test("create repository", async ({
  page,
  repositoryPage,
  repositoryStorage,
  mainPage,
}) => {
  await page.goto("/");

  const project = "Project1";
  await repositoryPage.enterName(project);
  await repositoryPage.clickCreate();

  const repos = await repositoryStorage.getRepositories();
  const repo = Object.values(repos)[0];
  expect(repo).toMatchObject({ name: project });

  await repositoryPage.clickOpen();
  await page.waitForURL(`/${project}`);
  await mainPage.checkRepositorySelect(project);
});
