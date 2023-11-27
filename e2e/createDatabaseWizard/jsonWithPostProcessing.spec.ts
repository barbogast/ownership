import * as R from "remeda";

import { test, expect } from "../fixtures";

const organization = "org1";
const repository = "repo1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(organization, repository);
});

const fileContent = JSON.stringify([
  { name: "John", age: 22, address: "Mainstreet 10", zip: 11111 },
  { name: "Carl", age: 33, address: "Otherstreet 20", zip: 2222 },
  { name: "Jude", age: 44, address: "Littlestreet 30", zip: 33333 },
]);

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
  await page.goto(`/${organization}/${repository}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("json");
  await createDatabaseDefinitionPage.enablePostProcessing();
  await createDatabaseDefinitionPage.next();

  await editor.setContent(0, fileContent);
  await createDatabaseDefinitionPage.next();

  const replacements = [
    {
      find: `type Data = unknown`,
      replaceWith: `type Data = { name: string, age: number, address: string, zip: number }[]`,
    },
    {
      find: `return []`,
      // Split address into street and houseNumber
      replaceWith: `return Object.values(files)[0]!.map(({ address, ...row }) => ({
        ...row,
        street: address.split(" ")[0],
        houseNumber: address.split(" ")[1],
      }));`,
    },
  ];
  const postProcessingCode = await editor.replaceText(0, replacements);

  await createDatabaseDefinitionPage.execute();

  const expected = [
    {
      name: "John",
      age: "22",
      street: "Mainstreet",
      houseNumber: "10",
      zip: "11111",
    },
    {
      name: "Carl",
      age: "33",
      street: "Otherstreet",
      houseNumber: "20",
      zip: "2222",
    },
    {
      name: "Jude",
      age: "44",
      street: "Littlestreet",
      houseNumber: "30",
      zip: "33333",
    },
  ];

  const received = await tableDisplay.getTableContent();

  expect(received).toEqual(expected);

  await createDatabaseDefinitionPage.next();

  const columns = await createDatabaseDefinitionPage.getDetectedColumns();
  expect(columns).toEqual([
    { sourceName: "name", dbName: "name", type: "text" },
    { sourceName: "age", dbName: "age", type: "integer" },
    { sourceName: "zip", dbName: "zip", type: "integer" },
    { sourceName: "street", dbName: "street", type: "text" },
    { sourceName: "houseNumber", dbName: "houseNumber", type: "text" },
  ]);

  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.modifyTableName(tableName);
  await createDatabaseDefinitionPage.modifDatabaseLabel(label);

  await createDatabaseDefinitionPage.finish();

  const defs = await databaseDefinitionStorage.getDbDefs();
  const def = Object.values(defs)[0]!;
  expect(R.omit(def, ["id"])).toEqual({
    source: "json",
    enablePostProcessing: true,
    importCode: "",
    sourceFiles: { "file1.json": fileContent },
    postProcessingCode,
    columns,
    label,
    tableName,
  });
});
