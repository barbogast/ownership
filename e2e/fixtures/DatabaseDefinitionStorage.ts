import { Page } from "@playwright/test";
import * as R from "remeda";

import { getIndexedDbContent } from "../utils";

export class DatabaseDefinitionStorage {
  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  async getDbDefs() {
    const url = new URL(this.#page.url());
    const [_, organization, repository, __] = url.pathname.split("/");

    const content = await getIndexedDbContent(
      this.#page,
      `${organization}/${repository}/databases`
    );

    if (
      R.isObject(content) &&
      "state" in content &&
      R.isObject(content.state)
    ) {
      return content.state;
    } else {
      throw new Error("Unexpected localStorage content");
    }
  }
}
