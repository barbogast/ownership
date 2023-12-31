import { test as base, expect } from "@playwright/test";
import { ProjectPage } from "./ProjectPage";
import { ProjectStorage as ProjectStorage } from "./ProjectStorage";
import { MainPage } from "./MainPage";
import { CreateDatabaseDefinitionPage } from "./CreateDatabaseDefinitionPage";
import { MainMenu } from "./MainMenu";
import { DatabaseDefinitionStorage } from "./DatabaseDefinitionStorage";
import { TableDisplay } from "./TableDisplay";
import { Editor } from "./Editor";
import { GitModal } from "./GitModal";

type MyFixtures = {
  projectPage: ProjectPage;
  projectStorage: ProjectStorage;
  mainPage: MainPage;
  mainMenu: MainMenu;
  createDatabaseDefinitionPage: CreateDatabaseDefinitionPage;
  databaseDefinitionStorage: DatabaseDefinitionStorage;
  tableDisplay: TableDisplay;
  checkConsole: void;
  editor: Editor;
  gitModal: GitModal;
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

  projectPage: async ({ page }, use) => {
    const projectPage = new ProjectPage(page);
    await use(projectPage);
  },
  projectStorage: async ({ context, page }, use) => {
    const projectStorage = new ProjectStorage(page, context);
    await use(projectStorage);
  },
  databaseDefinitionStorage: async ({ page, context }, use) => {
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
  tableDisplay: async ({ page }, use) => {
    const tableDisplay = new TableDisplay(page);
    await use(tableDisplay);
  },
  editor: async ({ page }, use) => {
    const editor = new Editor(page);
    await use(editor);
  },
  gitModal: async ({ page }, use) => {
    const gitModal = new GitModal(page);
    await use(gitModal);
  },
});

export { expect } from "@playwright/test";
