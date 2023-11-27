import { arraysToObjects } from "../../src/util/csv";
import { test, expect } from "../fixtures";

const organization = "org1";
const repository = "repo1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(organization, repository);
});

const fileContent = `name,age,address,zip
John,22,Mainstreet 10,11111
Carl,33,Otherstreet 20,02222
Jude,44,Littlestreet 30,33333`;

const label = "db1";
const tableName = "t1";

test("create database definition", async ({
  page,
  createDatabaseDefinitionPage,
  mainMenu,
  databaseDefinitionStorage,
  tableDisplay,
}) => {
  await page.goto(`/${organization}/${repository}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("csv");
  await createDatabaseDefinitionPage.enablePostProcessing();
  await createDatabaseDefinitionPage.next();

  await createDatabaseDefinitionPage.enterFileContent(fileContent);
  await createDatabaseDefinitionPage.next();

  const replacements = [
    {
      find: `  return {
    header: [],
    data: [],
  }`,
      // Split address into street and houseNumber
      replaceWith: `const file1 = Object.values(files)[0]
      return {
        header: ['name', 'age', 'street', 'houseNumber', 'zip'],
        data: file1.data.map(
          ([name, age, address, zip]) => ([
            name,
            age,
            address.split(' ')[0],
            address.split(' ')[1],
            zip
          ])
        ),
      }`,
    },
  ];
  await createDatabaseDefinitionPage.replaceEditorContent(replacements);

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
      zip: "02222",
    },
    {
      name: "Jude",
      age: "44",
      street: "Littlestreet",
      houseNumber: "30",
      zip: "33333",
    },
  ];

  const header = await tableDisplay.getHeader();
  const data = await tableDisplay.getBody();

  const received = arraysToObjects({ header, data });
  expect(received).toMatchObject(expected);

  await createDatabaseDefinitionPage.next();

  const columns = await createDatabaseDefinitionPage.getDetectedColumns();
  expect(columns).toMatchObject([
    { sourceName: "name", dbName: "name", type: "text" },
    { sourceName: "age", dbName: "age", type: "integer" },
    { sourceName: "street", dbName: "street", type: "text" },
    { sourceName: "houseNumber", dbName: "houseNumber", type: "integer" },
    { sourceName: "zip", dbName: "zip", type: "integer" },
  ]);

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
    columns,
  });
});
