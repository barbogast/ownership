import { Locator, Page, expect } from "@playwright/test";

export class MainPage {
  readonly #projectSelect: Locator;
  #loadButton: Locator;
  #saveButton: Locator;

  constructor(page: Page) {
    this.#projectSelect = page.getByTestId("project-select");
    this.#loadButton = page.getByRole("button", { name: "Load" });
    this.#saveButton = page.getByRole("button", { name: "Save" });
  }

  async checkProjectSelect(projectName: string) {
    await expect(this.#projectSelect).toContainText(`${projectName}`);
  }

  async clickLoad() {
    await this.#loadButton.click();
  }

  async clickSave() {
    await this.#saveButton.click();
  }
}
