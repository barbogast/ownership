import { Locator, Page } from "@playwright/test";

export class MainMenu {
  readonly #databaseFolder: Locator;
  readonly #createDatatbaseEntry: Locator;

  constructor(page: Page) {
    this.#databaseFolder = page.getByRole("menuitem", { name: "Databases" });
    this.#createDatatbaseEntry = page.getByText("+ Create new database");
  }

  async createDatabase() {
    await this.#databaseFolder.click();
    await this.#createDatatbaseEntry.click();
  }
}
