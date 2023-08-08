import { Locator, Page, expect } from "@playwright/test";

export class MainPage {
  readonly #repositorySelect: Locator;

  constructor(page: Page) {
    this.#repositorySelect = page.getByTestId("repository-select");
  }

  async checkRepositorySelect(organization: string, repository: string) {
    await expect(this.#repositorySelect).toContainText(
      `${organization}/${repository}`
    );
  }
}
