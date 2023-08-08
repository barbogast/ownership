import { test as base } from "@playwright/test";
import { RepositoryPage } from "./RepositoryPage";
import { RepositoryStorage } from "./RepositoryStorage";
import { MainPage } from "./MainPage";

type MyFixtures = {
  repositoryPage: RepositoryPage;
  repositoryStorage: RepositoryStorage;
  mainPage: MainPage;
};

export const test = base.extend<MyFixtures>({
  repositoryPage: async ({ page }, use) => {
    const repositoryPage = new RepositoryPage(page);
    await use(repositoryPage);
  },
  repositoryStorage: async ({ context }, use) => {
    const repositoryStorage = new RepositoryStorage(context);
    await use(repositoryStorage);
  },
  mainPage: async ({ page }, use) => {
    const mainPage = new MainPage(page);
    await use(mainPage);
  },
});

export { expect } from "@playwright/test";
