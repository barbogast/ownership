import { Page } from "@playwright/test";

import {
  CodeEditorElement,
  Replacements,
} from "../../src/components/CodeEditor";

export class Editor {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  #getEditorElement(index: number) {
    return this.#page.locator(".monaco-editor").nth(index);
  }

  async setContent(index: number, content: string) {
    await this.#getEditorElement(index).click();
    await this.#page.keyboard.press("Meta+KeyA");
    await this.#page.keyboard.type(content);
  }

  async replaceText(index: number, replacements: Replacements) {
    await this.#getEditorElement(index).evaluate(
      (el, { replacements }) => {
        (el as CodeEditorElement).__uiTestingReplaceText(replacements);
      },
      { replacements }
    );
  }
}
