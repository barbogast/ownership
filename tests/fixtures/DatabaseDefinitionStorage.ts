import { BrowserContext, Page } from "@playwright/test";

import { getLocalStorageContent } from "../utils";
import { isObject } from "../../src/util/utils";

export class DatabaseDefinitionStorage {
  readonly #context: BrowserContext;
  readonly #page: Page;

  constructor(page: Page, context: BrowserContext) {
    this.#context = context;
    this.#page = page;
  }

  async getDbDefs() {
    const url = new URL(this.#page.url());
    const [_, organization, repository, __] = url.pathname.split("/");

    const content = await getLocalStorageContent(
      this.#context,
      `${organization}/${repository}/databases`
    );

    if (isObject(content) && "state" in content && isObject(content.state)) {
      return content.state;
    } else {
      throw new Error("Unexpected localStorage content");
    }
  }
}
