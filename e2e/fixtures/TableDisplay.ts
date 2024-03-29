import { Locator, Page } from "@playwright/test";
import { arraysToObjects } from "../../src/util/csv";

export class TableDisplay {
  #header: Locator;
  #body: Locator;
  #container: Locator;

  constructor(page: Page) {
    this.#container = page.getByTestId("preview");
    this.#header = this.#container.locator("thead > tr > th");

    this.#body = this.#container
      // Narrowing via .ant-table-row is necessary to exclude a .ant-table-measure-row row
      .locator("tbody > tr.ant-table-row");
  }

  async getTableContent() {
    // Explicitly wait for the container to appear, otherwise the function
    //  will return an empty array instead of waiting for the element
    await this.#container.waitFor();

    const header: string[] = [];
    for (const cell of await this.#header.all()) {
      header.push((await cell.textContent())!);
    }

    const data: string[][] = [];
    for (const rowLocator of await this.#body.all()) {
      const row = [];
      for (const cell of await rowLocator.locator("td").all()) {
        row.push((await cell.textContent())!);
      }
      data.push(row);
    }

    return arraysToObjects({ header, data });
  }
}
