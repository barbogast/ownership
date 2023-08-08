import { test, expect } from "./fixtures";

test("create repository", async ({
  page,
  repositoryPage,
  repositoryStorage,
  mainPage,
}) => {
  await page.goto("/");

  const organization = "Org1";
  const repository = "Repo1";
  await repositoryPage.enterOrganization(organization);
  await repositoryPage.enterRepository(repository);
  await repositoryPage.clickCreate();

  const repos = await repositoryStorage.getRepositories();
  const repo = Object.values(repos)[0];
  expect(repo).toMatchObject({ organization, repository });

  await repositoryPage.clickOpen();
  await page.waitForURL(`/${organization}/${repository}`);
  await mainPage.checkRepositorySelect(organization, repository);
});
