import { Locator, Page, expect } from "@playwright/test";

export class MainPage {
  readonly #repositorySelect: Locator;

  constructor(page: Page) {
    this.#repositorySelect = page.getByTestId("repository-select");
  }

  async checkRepositorySelect(repository: string) {
    await expect(this.#repositorySelect).toContainText(`${repository}`);
  }
}
