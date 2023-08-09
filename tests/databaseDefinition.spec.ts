import { test, expect } from "./fixtures";

const organization = "org1";
const repository = "repo1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(organization, repository);
});

const csvContent = `name,age,address,zip
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
}) => {
  await page.goto(`/${organization}/${repository}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.enterCsvContent(csvContent);
  await createDatabaseDefinitionPage.next();

  const columns = await createDatabaseDefinitionPage.getDetectedColumns();
  expect(columns).toMatchObject([
    { csvName: "name", dbName: "name", type: "text" },
    { csvName: "age", dbName: "age", type: "integer" },
    { csvName: "address", dbName: "address", type: "text" },
    { csvName: "zip", dbName: "zip", type: "integer" },
  ]);

  await createDatabaseDefinitionPage.modifyColumnNameInDb("address", "street");
  await createDatabaseDefinitionPage.modifyColumnType("zip", "text");

  const changedColumns =
    await createDatabaseDefinitionPage.getDetectedColumns();
  const changedColumnDefinitions = [
    { csvName: "name", dbName: "name", type: "text" },
    { csvName: "age", dbName: "age", type: "integer" },
    { csvName: "address", dbName: "street", type: "text" },
    { csvName: "zip", dbName: "zip", type: "text" },
  ];
  expect(changedColumns).toMatchObject(changedColumnDefinitions);

  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.modifyTableName(tableName);
  await createDatabaseDefinitionPage.modifDatabaseLabel(label);

  await createDatabaseDefinitionPage.finish();

  const defs = await databaseDefinitionStorage.getDbDefs();
  const def = Object.values(defs)[0];
  expect(def).toMatchObject({
    csvContent,
    label,
    tableName,
    columns: changedColumnDefinitions,
  });
});
