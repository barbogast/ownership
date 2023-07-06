import { describe, expect, test } from "vitest";

import { splitLabel, getNewLabel, getPositionFromStacktrace } from "./utils";

test("splitLabel", () => {
  expect(splitLabel("aaa")).toEqual(["aaa", undefined]);
  expect(splitLabel("aaa (1)")).toEqual(["aaa", 1]);
  expect(splitLabel("aaa (10)")).toEqual(["aaa", 10]);
});

describe("getNewLabel", () => {
  const existing = ["bbb", "ccc", "ccc (1)", "ccc (2)"];

  describe("label has no number", () => {
    test("no conflict -> return the same label", () => {
      expect(getNewLabel(existing, "aaa")).toEqual("aaa");
    });

    test("conflict -> add the number", () => {
      expect(getNewLabel(existing, "bbb")).toEqual("bbb (1)");
    });

    test("conflict -> increment the number", () => {
      expect(getNewLabel(existing, "ccc")).toEqual("ccc (3)");
    });
  });

  describe("label has number", () => {
    test("no conflict -> return the same label", () => {
      expect(getNewLabel(existing, "aaa (1)")).toEqual("aaa (1)");
    });

    test("no conflict (existing label has no number) -> return the same label", () => {
      expect(getNewLabel(existing, "bbb (1)")).toEqual("bbb (1)");
    });

    test("no conflict (new number is greater than existing ones) -> return the same label", () => {
      expect(getNewLabel(existing, "ccc (3)")).toEqual("ccc (3)");
    });

    test("conflict -> increment number", () => {
      expect(getNewLabel(existing, "ccc (2)")).toEqual("ccc (3)");
    });
  });
});

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
