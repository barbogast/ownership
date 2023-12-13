import { Locator, Page } from "@playwright/test";

export class RepositoryPage {
  readonly #inputName: Locator;
  readonly #buttonCreate: Locator;
  readonly #buttonOpen: Locator;

  constructor(page: Page) {
    this.#inputName = page.getByPlaceholder("Name");
    this.#buttonCreate = page.getByRole("button", { name: "Create" });
    this.#buttonOpen = page.getByRole("button", { name: "Open" });
  }

  async enterName(name: string) {
    await this.#inputName.fill(name);
  }

  async clickCreate() {
    await this.#buttonCreate.click();
  }

  async clickOpen() {
    await this.#buttonOpen.click();
  }
}
