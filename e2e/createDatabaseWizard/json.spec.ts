import { test, expect } from "../fixtures";

const organization = "org1";
const repository = "repo1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(organization, repository);
});

const fileContent = JSON.stringify([
  { name: "John", age: 22, address: "Mainstreet", zip: 11111 },
  { name: "Carl", age: 33, address: "Otherstreet", zip: 2222 },
  { name: "Jude", age: 44, address: "Littlestreet", zip: 33333 },
]);

const label = "db1";
const tableName = "t1";

test("create database definition", async ({
  page,
  createDatabaseDefinitionPage,
  mainMenu,
  databaseDefinitionStorage,
}) => {
  await page.goto(`/${organization}/${repository}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("json");
  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.enterFileContent(fileContent);
  await createDatabaseDefinitionPage.next();

  const columns = await createDatabaseDefinitionPage.getDetectedColumns();
  expect(columns).toMatchObject([
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
  const def = Object.values(defs)[0];
  expect(def).toMatchObject({
    sourceFiles: { "file1.json": fileContent },
    label,
    tableName,
    columns,
  });
});