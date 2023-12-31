import { Page } from "@playwright/test";

export class GitModal {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  async fillForm(url: string, username: string, password: string) {
    await this.#page.fill('[placeholder="URL"]', url);
    await this.#page.fill('[placeholder="Username"]', username);
    await this.#page.fill('[placeholder="Password"]', password);
  }

  async clickSave() {
    await this.#page.click('button:has-text("OK")');
  }

  async waitForSuccess() {
    await this.#page
      .getByText("Export to repository was successful.")
      .waitFor();
  }
}
