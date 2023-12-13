import * as R from "remeda";

import { test, expect } from "../fixtures";

const projectName = "project1";

test.beforeEach(async ({ repositoryStorage }) => {
  await repositoryStorage.addRepository(projectName);
});

const fileContent = ["col1\naaa", "col1\nbbb", "col1\nccc"] as const;
const label = "db1";
const tableName = "t1";

test("import 3 files and change a filename", async ({
  page,
  createDatabaseDefinitionPage,
  mainMenu,
  editor,
  databaseDefinitionStorage,
}) => {
  await page.goto(`/${projectName}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("csv");
  await createDatabaseDefinitionPage.next();

  await editor.setContent(0, fileContent[0]);

  await createDatabaseDefinitionPage.addFile();
  await editor.setContent(1, fileContent[1]);
  await createDatabaseDefinitionPage.setFileName(1, "changed.csv");

  await createDatabaseDefinitionPage.addFile();
  await editor.setContent(2, fileContent[2]);

  await createDatabaseDefinitionPage.next();

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
    sourceFiles: {
      "file1.csv": fileContent[0],
      "changed.csv": fileContent[1],
      "file3.csv": fileContent[2],
    },
    postProcessingCode: "",
    columns: [{ dbName: "col1", sourceName: "col1", type: "text" }],
    label,
    tableName,
  });
});

test("import 3 files and delete the second one", async ({
  page,
  createDatabaseDefinitionPage,
  mainMenu,
  editor,
  databaseDefinitionStorage,
}) => {
  await page.goto(`/${projectName}`);

  await mainMenu.createDatabase();

  await createDatabaseDefinitionPage.selectSource("csv");
  await createDatabaseDefinitionPage.next();

  await editor.setContent(0, fileContent[0]);

  await createDatabaseDefinitionPage.addFile();
  await editor.setContent(1, fileContent[1]);

  await createDatabaseDefinitionPage.addFile();
  await editor.setContent(2, fileContent[2]);

  await createDatabaseDefinitionPage.deleteFile(1);

  await createDatabaseDefinitionPage.next();

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
    sourceFiles: {
      "file1.csv": fileContent[0],
      "file3.csv": fileContent[2],
    },
    postProcessingCode: "",
    columns: [{ dbName: "col1", sourceName: "col1", type: "text" }],
    label,
    tableName,
  });
});
