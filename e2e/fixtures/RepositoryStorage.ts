import { BrowserContext, Page } from "@playwright/test";
import * as R from "remeda";

import { getLocalStorageContent, setLocalStorageContent } from "../utils";
import { createId } from "../../src/util/utils";
import { Repository } from "../../src/repository/repositoryStore";

export class RepositoryStorage {
  readonly #context: BrowserContext;
  readonly #page: Page;

  constructor(page: Page, context: BrowserContext) {
    this.#context = context;
    this.#page = page;
  }

  async getRepositories() {
    const repositoriesState = await getLocalStorageContent(
      this.#context,
      "repositories"
    );

    if (
      R.isObject(repositoriesState) &&
      "state" in repositoriesState &&
      R.isObject(repositoriesState.state) &&
      "repositories" in repositoriesState.state &&
      R.isObject(repositoriesState.state.repositories)
    ) {
      return repositoriesState.state.repositories;
    } else {
      throw new Error("Unexpected localStorage content");
    }
  }

  async addRepository(organization: string, repository: string) {
    const id = createId();
    const newRepository: Repository = {
      id,
      name: repository,
      organization,
      repository,
    };
    const content = {
      state: { repositories: { [id]: newRepository } },
      version: 0,
    };
    await setLocalStorageContent(this.#page, "repositories", content);
  }
}
