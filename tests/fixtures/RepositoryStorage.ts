import { v4 as uuidv4 } from "uuid";
import { BrowserContext, Page } from "@playwright/test";

import { getLocalStorageContent, setLocalStorageContent } from "../utils";
import { isObject } from "../../src/util/utils";
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
      isObject(repositoriesState) &&
      "state" in repositoriesState &&
      isObject(repositoriesState.state) &&
      "repositories" in repositoriesState.state &&
      isObject(repositoriesState.state.repositories)
    ) {
      return repositoriesState.state.repositories;
    } else {
      throw new Error("Unexpected localStorage content");
    }
  }

  async addRepository(organization: string, repository: string) {
    const id = uuidv4();
    const newRepository: Repository = {
      id,
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
