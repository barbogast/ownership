import { Page, BrowserContext } from "@playwright/test";
import * as R from "remeda";

import { getIndexedDbContent } from "../utils";
import { DatabaseDefinition } from "../../src/databaseDefinition/databaseDefinitionStore";
import { ProjectStorage } from "./ProjectStorage";

export class DatabaseDefinitionStorage {
  readonly #page: Page;
  #context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.#page = page;
    this.#context = context;
  }

  async getDbDefs() {
    const projectStorage = new ProjectStorage(this.#page, this.#context);
    const projects = await projectStorage.getProjects();
    const url = new URL(this.#page.url());
    const [_, name, __] = url.pathname.split("/");

    const project = Object.values(projects).find((p) => p.name === name);
    if (!project) {
      throw new Error(`No project found for ${name}`);
    }

    const content = await getIndexedDbContent(
      this.#page,
      `${project.id}/databases`
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
