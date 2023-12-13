import stringify from "safe-stable-stringify";
import * as R from "remeda";

import { test, expect } from "../fixtures";

const organization = "org1";
const repository = "repo1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(organization, repository);
});

const returnValue = [
  { name: "John", age: 22, address: "Mainstreet", zip: 11111 },
  { name: "Carl", age: 33, address: "Otherstreet", zip: 2222 },
  { name: "Jude", age: 44, address: "Littlestreet", zip: 33333 },
];

const label = "db1";
const tableName = "t1";

test("create database definition", async ({
  page,
  createDatabaseDefinitionPage,
  mainMenu,
  databaseDefinitionStorage,
  tableDisplay,
  editor,
}) => {
  await page.goto(`/${repository}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("code");
  await createDatabaseDefinitionPage.next();

  const importCode = await editor.replaceText(0, [
    {
      find: `return []`,
      replaceWith: `return ${JSON.stringify(returnValue, null, 2)}`,
    },
  ]);

  await createDatabaseDefinitionPage.execute();

  const received = await tableDisplay.getTableContent();
  const expected = returnValue.map((row) =>
    // The retrieved values from the DOM are all strings, so we need to convert
    // the expected values to make them comparable
    R.mapValues(row, (v) => v.toString())
  );
  expect(received).toEqual(expected);

  await createDatabaseDefinitionPage.next();

  const columns = await createDatabaseDefinitionPage.getDetectedColumns();
  expect(columns).toEqual([
    { sourceName: "name", dbName: "name", type: "text" },
    { sourceName: "age", dbName: "age", type: "integer" },
    { sourceName: "address", dbName: "address", type: "text" },
    { sourceName: "zip", dbName: "zip", type: "integer" },
  ]);

  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.modifyTableName(tableName);
  await createDatabaseDefinitionPage.modifDatabaseLabel(label);

  await createDatabaseDefinitionPage.finish();

  const defs = await databaseDefinitionStorage.getDbDefs();
  const def = Object.values(defs)[0]!;
  expect(R.omit(def, ["id"])).toEqual({
    source: "code",
    enablePostProcessing: false,
    importCode,
    sourceFiles: { "file.json": stringify(returnValue, null, 2) },
    postProcessingCode: "",
    columns,
    label,
    tableName,
  });
});
