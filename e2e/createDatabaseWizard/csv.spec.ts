import * as R from "remeda";

import { test, expect } from "../fixtures";

const projectName = "project1";

test.beforeEach(async ({ projectStorage }) => {
  await projectStorage.addProject(projectName);
});

const fileContent = `name,age,address,zip
John,22,Mainstreet,11111
Carl,33,Otherstreet,02222
Jude,44,Littlestreet,33333`;
const label = "db1";
const tableName = "t1";

test("create database definition", async ({
  page,
  createDatabaseDefinitionPage,
  mainMenu,
  databaseDefinitionStorage,
  editor,
}) => {
  await page.goto(`/${projectName}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("csv");
  await createDatabaseDefinitionPage.next();

  await editor.setContent(0, fileContent);
  await createDatabaseDefinitionPage.next();

  const columns = await createDatabaseDefinitionPage.getDetectedColumns();
  expect(columns).toEqual([
    { sourceName: "name", dbName: "name", type: "text" },
    { sourceName: "age", dbName: "age", type: "integer" },
    { sourceName: "address", dbName: "address", type: "text" },
    { sourceName: "zip", dbName: "zip", type: "integer" },
  ]);

  await createDatabaseDefinitionPage.modifyColumnNameInDb("address", "street");
  await createDatabaseDefinitionPage.modifyColumnType("zip", "text");

  const changedColumns =
    await createDatabaseDefinitionPage.getDetectedColumns();
  const changedColumnDefinitions = [
    { sourceName: "name", dbName: "name", type: "text" },
    { sourceName: "age", dbName: "age", type: "integer" },
    { sourceName: "address", dbName: "street", type: "text" },
    { sourceName: "zip", dbName: "zip", type: "text" },
  ];
  expect(changedColumns).toEqual(changedColumnDefinitions);

  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.modifyTableName(tableName);
  await createDatabaseDefinitionPage.modifDatabaseLabel(label);

  await createDatabaseDefinitionPage.finish();

  const defs = await databaseDefinitionStorage.getDbDefs();
  const def = Object.values(defs)[0]!;
  expect(R.omit(def, ["id"])).toEqual({
    source: "csv",
    enablePostProcessing: false,
    importCode: "",
    sourceFiles: { "file1.csv": fileContent },
    postProcessingCode: "",
    columns: changedColumnDefinitions,
    label,
    tableName,
  });
});
