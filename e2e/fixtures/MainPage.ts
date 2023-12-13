import { Locator, Page, expect } from "@playwright/test";

export class MainPage {
  readonly #projectSelect: Locator;

  constructor(page: Page) {
    this.#projectSelect = page.getByTestId("project-select");
  }

  async checkProjectSelect(projectName: string) {
    await expect(this.#projectSelect).toContainText(`${projectName}`);
  }
}
