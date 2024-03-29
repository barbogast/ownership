import { Locator, Page } from "@playwright/test";

import { ColumnDefinition } from "../../src/util/database";

type SourceLocators = { csv: Locator; json: Locator; code: Locator };

export class CreateDatabaseDefinitionPage {
  readonly #buttonNext: Locator;
  readonly #columnRow: Locator;
  readonly #columnTypeSelect: Locator;
  #tableName: Locator;
  #databaseLabel: Locator;
  #buttonFinish: Locator;
  #source: SourceLocators;
  #buttonExecute: Locator;
  #enablePostProcessing: Locator;
  #buttonAddFile: Locator;
  #inputFileName: Locator;
  #buttonDelete: Locator;
  #buttonDeleteConfirm: Locator;

  constructor(page: Page) {
    this.#buttonNext = page.getByRole("button", { name: "Next" });
    this.#buttonFinish = page.getByRole("button", { name: "Add new database" });
    this.#buttonExecute = page.getByRole("button", { name: "Preview" });
    this.#buttonAddFile = page.getByRole("button", { name: "Add file" });
    this.#buttonDelete = page.getByRole("button", { name: "x" });
    this.#buttonDeleteConfirm = page.getByRole("button", { name: "OK" });
    this.#source = {
      csv: page.locator('input[type="radio"][value="csv"]'),
      json: page.locator('input[type="radio"][value="json"]'),
      code: page.locator('input[type="radio"][value="code"]'),
    };
    this.#enablePostProcessing = page.locator("text=Enable post-processing");
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
    this.#inputFileName = page.getByTestId("file-name-input");
  }

  async next() {
    await this.#buttonNext.click();
  }

  async finish() {
    await this.#buttonFinish.click();
  }

  async addFile() {
    await this.#buttonAddFile.click();
  }

  async deleteFile(index: number) {
    await this.#buttonDelete.nth(index).click();
    await this.#buttonDeleteConfirm.click();
  }

  async setFileName(index: number, fileName: string) {
    await this.#inputFileName.nth(index).fill(fileName);
  }

  async execute() {
    await this.#buttonExecute.click();
  }

  async selectSource(sourceType: keyof SourceLocators) {
    await this.#source[sourceType].click();
  }

  async enablePostProcessing() {
    await this.#enablePostProcessing.check();
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
    columnNameInSource: string,
    newColumnNameInDb: string
  ) {
    for (const row of await this.#columnRow.all()) {
      const columns = await row.locator("div");
      const colNameInSource = await columns.nth(0).textContent();
      if (colNameInSource === columnNameInSource) {
        await columns.nth(1).locator("input").fill(newColumnNameInDb);
        return;
      }
    }
    throw new Error(`Column ${columnNameInSource} not found`);
  }

  async modifyColumnType(columnNameInSource: string, columnType: string) {
    for (const row of await this.#columnRow.all()) {
      const columns = await row.locator("div");
      const colNameInSource = await columns.nth(0).textContent();
      if (colNameInSource === columnNameInSource) {
        await columns.nth(2).click();

        // For some weird reason .click() doesn't work here
        await this.#columnTypeSelect.getByText(columnType).hover();
        await this.#columnTypeSelect.getByText(columnType).press("Enter");

        return;
      }
    }
    throw new Error(`Column ${columnNameInSource} not found`);
  }

  async modifyTableName(newName: string) {
    await this.#tableName.fill(newName);
  }

  async modifDatabaseLabel(newName: string) {
    await this.#databaseLabel.fill(newName);
  }
}
