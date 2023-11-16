import { Locator, Page } from "@playwright/test";

import { ColumnDefinition } from "../../src/util/database";

export class CreateDatabaseDefinitionPage {
  readonly #buttonNext: Locator;
  readonly #textAreaCsvContent: Locator;
  readonly #columnRow: Locator;
  readonly #columnTypeSelect: Locator;
  #tableName: Locator;
  #databaseLabel: Locator;
  #buttonFinish: Locator;

  constructor(page: Page) {
    this.#buttonNext = page.getByRole("button", { name: "Next" });
    this.#buttonFinish = page.getByRole("button", { name: "Add new database" });
    this.#textAreaCsvContent = page.getByTestId("csv-textarea");
    this.#columnRow = page.getByTestId("column-row");
    this.#columnTypeSelect = page.locator(".ant-select-item-option-content");
    this.#tableName = page
      .locator(".ant-input-wrapper")
      .filter({ has: page.getByText("Table name") })
      .locator("input");
    this.#databaseLabel = page
      .locator(".ant-input-wrapper")
      .filter({ has: page.getByText("Database label") })
      .locator("input");
  }

  async next() {
    await this.#buttonNext.click();
  }

  async finish() {
    await this.#buttonFinish.click();
  }

  async enterCsvContent(content: string) {
    await this.#textAreaCsvContent.fill(content);
  }

  async getDetectedColumns() {
    const columnDefs: ColumnDefinition[] = [];
    for (const row of await this.#columnRow.all()) {
      const columns = await row.locator("div");
      const sourceName = (await columns.nth(0).textContent()) || "";
      const dbName = (await columns.nth(1).locator("input").inputValue()) || "";
      const type = (await columns.nth(2).textContent()) || "";
      columnDefs.push({
        sourceName,
        dbName,
        type: type.toLocaleLowerCase() as ColumnDefinition["type"],
      });
    }

    return columnDefs;
  }

  async modifyColumnNameInDb(
    columnNameInCsv: string,
    newColumnNameInDb: string
  ) {
    for (const row of await this.#columnRow.all()) {
      const columns = await row.locator("div");
      const colNameInCsv = await columns.nth(0).textContent();
      if (colNameInCsv === columnNameInCsv) {
        await columns.nth(1).locator("input").fill(newColumnNameInDb);
        return;
      }
    }
    throw new Error(`Column ${columnNameInCsv} not found`);
  }

  async modifyColumnType(columnNameInCsv: string, columnType: string) {
    for (const row of await this.#columnRow.all()) {
      const columns = await row.locator("div");
      const colNameInCsv = await columns.nth(0).textContent();
      if (colNameInCsv === columnNameInCsv) {
        await columns.nth(2).click();

        // For some weird reason .click() doesn't work here
        await this.#columnTypeSelect.getByText(columnType).hover();
        await this.#columnTypeSelect.getByText(columnType).press("Enter");

        return;
      }
    }
    throw new Error(`Column ${columnNameInCsv} not found`);
  }

  async modifyTableName(newName: string) {
    await this.#tableName.fill(newName);
  }

  async modifDatabaseLabel(newName: string) {
    await this.#databaseLabel.fill(newName);
  }
}
