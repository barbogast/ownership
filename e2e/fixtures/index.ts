import { test as base } from "@playwright/test";
import { RepositoryPage } from "./RepositoryPage";
import { RepositoryStorage } from "./RepositoryStorage";
import { MainPage } from "./MainPage";
import { CreateDatabaseDefinitionPage } from "./CreateDatabaseDefinitionPage";
import { MainMenu } from "./MainMenu";
import { DatabaseDefinitionStorage } from "./DatabaseDefinitionStorage";

type MyFixtures = {
  repositoryPage: RepositoryPage;
  repositoryStorage: RepositoryStorage;
  mainPage: MainPage;
  mainMenu: MainMenu;
  createDatabaseDefinitionPage: CreateDatabaseDefinitionPage;
  databaseDefinitionStorage: DatabaseDefinitionStorage;
};

export const test = base.extend<MyFixtures>({
  repositoryPage: async ({ page }, use) => {
    const repositoryPage = new RepositoryPage(page);
    await use(repositoryPage);
  },
  repositoryStorage: async ({ context, page }, use) => {
    const repositoryStorage = new RepositoryStorage(page, context);
    await use(repositoryStorage);
  },
  databaseDefinitionStorage: async ({ context, page }, use) => {
    const f = new DatabaseDefinitionStorage(page, context);
    await use(f);
  },
  mainPage: async ({ page }, use) => {
    const mainPage = new MainPage(page);
    await use(mainPage);
  },
  mainMenu: async ({ page }, use) => {
    const f = new MainMenu(page);
    await use(f);
  },
  createDatabaseDefinitionPage: async ({ page }, use) => {
    const dbDefPage = new CreateDatabaseDefinitionPage(page);
    await use(dbDefPage);
  },
});

export { expect } from "@playwright/test";
