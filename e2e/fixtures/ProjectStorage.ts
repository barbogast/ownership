import { BrowserContext, Page } from "@playwright/test";
import * as R from "remeda";

import { getLocalStorageContent, setLocalStorageContent } from "../utils";
import { createId } from "../../src/util/utils";
import { Project, ProjectStoreState } from "../../src/project/projectStore";

export class ProjectStorage {
  readonly #context: BrowserContext;
  readonly #page: Page;

  constructor(page: Page, context: BrowserContext) {
    this.#context = context;
    this.#page = page;
  }

  async getProjects() {
    const projectState = await getLocalStorageContent(
      this.#context,
      "projects"
    );

    if (
      R.isObject(projectState) &&
      "state" in projectState &&
      R.isObject(projectState.state)
    ) {
      return projectState.state as ProjectStoreState;
    } else {
      throw new Error("Unexpected localStorage content");
    }
  }

  async addProject(projectName: string) {
    const id = createId();
    const newProject: Project = {
      id,
      name: projectName,
    };
    const content = {
      state: { [id]: newProject },
      version: 0,
    };
    await setLocalStorageContent(this.#page, "projects", content);
  }
}
