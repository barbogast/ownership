import { Page, BrowserContext } from "@playwright/test";
import * as R from "remeda";

import { getIndexedDbContent, getLocalStorageContent } from "../utils";
import { DatabaseDefinition } from "../../src/databaseDefinition/databaseDefinitionStore";
import { RepositoryState } from "../../src/repository/repositoryStore";

export class DatabaseDefinitionStorage {
  readonly #page: Page;
  #context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.#page = page;
    this.#context = context;
  }

  async getDbDefs() {
    const store = (await getLocalStorageContent(
      this.#context,
      "repositories"
    )) as { state: RepositoryState; version: number };
    const url = new URL(this.#page.url());
    const [_, name, __] = url.pathname.split("/");

    const repository = Object.values(store.state.repositories).find(
      (r) => r.name === name
    );
    if (!repository) {
      throw new Error(`No repository found for ${name}`);
    }

    const content = await getIndexedDbContent(
      this.#page,
      `${repository.id}/databases`
    );

    if (
      R.isObject(content) &&
      "state" in content &&
      R.isObject(content.state)
    ) {
      return content.state as Record<string, DatabaseDefinition>;
    } else {
      throw new Error("Unexpected localStorage content");
    }
  }
}
