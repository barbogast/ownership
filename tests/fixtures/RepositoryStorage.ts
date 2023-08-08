import { BrowserContext } from "@playwright/test";
import { getLocalStorageContent } from "../utils";
import { isObject } from "../../src/util/utils";

export class RepositoryStorage {
  readonly #context: BrowserContext;

  constructor(context: BrowserContext) {
    this.#context = context;
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
}
