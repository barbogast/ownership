import { Locator, Page } from "@playwright/test";

export class RepositoryPage {
  readonly #inputOrganization: Locator;
  readonly #inputRepository: Locator;
  readonly #buttonCreate: Locator;
  readonly #buttonOpen: Locator;

  constructor(page: Page) {
    this.#inputOrganization = page.getByPlaceholder("Organization");
    this.#inputRepository = page.getByPlaceholder("Repository");
    this.#buttonCreate = page.getByRole("button", { name: "Create" });
    this.#buttonOpen = page.getByRole("button", { name: "Open" });
  }

  async enterOrganization(organization: string) {
    await this.#inputOrganization.fill(organization);
  }

  async enterRepository(repository: string) {
    await this.#inputRepository.fill(repository);
  }

  async clickCreate() {
    await this.#buttonCreate.click();
  }

  async clickOpen() {
    await this.#buttonOpen.click();
  }
}
