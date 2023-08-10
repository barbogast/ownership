import { describe, expect, test } from "vitest";

import { getPositionFromStacktrace } from "./codeExecution";

describe("getPositionFromStacktrace", () => {
  test("should return position", () => {
    const stack = `useQueryController.ts:82 Error
    at transform (eval at runTransform (useQueryController.ts:77:20), <anonymous>:9:11)
    at eval (eval at runTransform (useQueryController.ts:77:20), <anonymous>:20:16)
    at runTransform (useQueryController.ts:78:22)
    at useQueryController.ts:143:9
    at commitHookEffectListMount (react-dom.development.js:23150:26)`;

    expect(getPositionFromStacktrace(stack)).toEqual({ line: 7, column: 11 });
  });
});
