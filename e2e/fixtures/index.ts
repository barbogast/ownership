import { test as base, expect } from "@playwright/test";
import { RepositoryPage } from "./RepositoryPage";
import { RepositoryStorage } from "./RepositoryStorage";
import { MainPage } from "./MainPage";
import { CreateDatabaseDefinitionPage } from "./CreateDatabaseDefinitionPage";
import { MainMenu } from "./MainMenu";
import { DatabaseDefinitionStorage } from "./DatabaseDefinitionStorage";
import { TableDisplay } from "./TableDisplay";
import { Editor } from "./Editor";

type MyFixtures = {
  repositoryPage: RepositoryPage;
  repositoryStorage: RepositoryStorage;
  mainPage: MainPage;
  mainMenu: MainMenu;
  createDatabaseDefinitionPage: CreateDatabaseDefinitionPage;
  databaseDefinitionStorage: DatabaseDefinitionStorage;
  tableDisplay: TableDisplay;
  checkConsole: void;
  editor: Editor;
};

export const test = base.extend<MyFixtures>({
  checkConsole: [
    async ({ page }, use) => {
      const messages: string[] = [];
      page.on("console", (msg) => {
        // Ignore regular log messages; we are only interested in errors.
        if (msg.type() === "error" || msg.type() === "warning") {
          messages.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      // Uncaught (in promise) TypeError + friends are page errors.
      page.on("pageerror", (error) => {
        messages.push(`[${error.name}] ${error.message}`);
      });
      await use();
      expect(messages, "Errors where logged to the browser console").toEqual(
        []
      );
    },
    { auto: true },
  ],

  repositoryPage: async ({ page }, use) => {
    const repositoryPage = new RepositoryPage(page);
    await use(repositoryPage);
  },
  repositoryStorage: async ({ context, page }, use) => {
    const repositoryStorage = new RepositoryStorage(page, context);
    await use(repositoryStorage);
  },
  databaseDefinitionStorage: async ({ page }, use) => {
    const f = new DatabaseDefinitionStorage(page);
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
  tableDisplay: async ({ page }, use) => {
    const tableDisplay = new TableDisplay(page);
    await use(tableDisplay);
  },
  editor: async ({ page }, use) => {
    const editor = new Editor(page);
    await use(editor);
  },
});

export { expect } from "@playwright/test";
