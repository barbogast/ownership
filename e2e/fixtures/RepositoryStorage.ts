import { BrowserContext, Page } from "@playwright/test";
import * as R from "remeda";

import { getLocalStorageContent, setLocalStorageContent } from "../utils";
import { createId } from "../../src/util/utils";
import { Project } from "../../src/repository/repositoryStore";

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
      R.isObject(projectState.state) &&
      "projects" in projectState.state &&
      R.isObject(projectState.state.projects)
    ) {
      return projectState.state.projects as Record<string, Project>;
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
      state: { projects: { [id]: newProject } },
      version: 0,
    };
    await setLocalStorageContent(this.#page, "projects", content);
  }
}
