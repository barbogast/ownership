import { Debug } from "../src/util/debug";
import { test, expect } from "./fixtures";

declare global {
  interface Window {
    __debug: Debug;
  }
}

const createDiv = () => {
  const element = document.createElement("div");
  element.setAttribute("id", "test-element");
  element.innerHTML = "Original content";
  document.body.appendChild(element);
};

function changeDiv() {
  // Don't use an arrow function here, because we want to access the name property of the function later on
  window.parent.document.getElementById("test-element")!.innerHTML =
    "Changed content";
}

// Let's first make sure that the test functions work as expected, when executed in the main window
test("Verify test functions", async ({ page }) => {
  await page.goto("/?e2e=yes");
  await page.evaluate(createDiv);
  await page.evaluate(changeDiv);
  await expect(page.locator("#test-element")).toContainText("Changed content");
});

// Now let's execute changeDiv() in the iframe, and make sure that it fails
test("Try to brake out of the iframe", async ({ page }) => {
  await page.goto("/?e2e=yes");

  await page.evaluate(createDiv);

  const result = await page.evaluate(
    async ({ func, name }) => {
      const { executeTypescriptCode } = await window.__debug.getE2eExports();
      return executeTypescriptCode(func, name, {});
    },
    { func: changeDiv.toString(), name: changeDiv.name }
  );

  expect(result).toHaveProperty("success", false);
  !result.success && expect(result.error.error).toContain("SecurityError");

  await expect(page.locator("#test-element")).toContainText("Original content");
});
