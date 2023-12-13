import { test, expect } from "./fixtures";

test("create project", async ({
  page,
  projectPage,
  projectStorage,
  mainPage,
}) => {
  await page.goto("/");

  const projectName = "Project1";
  await projectPage.enterName(projectName);
  await projectPage.clickCreate();

  const projects = await projectStorage.getProjects();
  const project = Object.values(projects)[0];
  expect(project).toMatchObject({ name: projectName });

  await projectPage.clickOpen();
  await page.waitForURL(`/${projectName}`);
  await mainPage.checkProjectSelect(projectName);
});
