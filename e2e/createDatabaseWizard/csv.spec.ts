import { test, expect } from "../fixtures";

const organization = "org1";
const repository = "repo1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(organization, repository);
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
}) => {
  await page.goto(`/${organization}/${repository}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("csv");
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
  expect(changedColumns).toMatchObject(changedColumnDefinitions);

  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.modifyTableName(tableName);
  await createDatabaseDefinitionPage.modifDatabaseLabel(label);

  await createDatabaseDefinitionPage.finish();

  const defs = await databaseDefinitionStorage.getDbDefs();
  const def = Object.values(defs)[0];
  expect(def).toMatchObject({
    sourceFiles: { "file1.csv": fileContent },
    label,
    tableName,
    columns: changedColumnDefinitions,
  });
});
