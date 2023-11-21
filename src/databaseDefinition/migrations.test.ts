import fs from "fs";
import { describe, expect, test } from "vitest";
import { stableStringify } from "../util/json";
import { migrations } from "./migrations";

describe("migrations for databaseDefinition", () => {
  test("migrations", async () => {
    let state = JSON.parse(
      fs.readFileSync(
        // v2 is the earliest version that I still had available
        "./src/databaseDefinition/migrationTestStates/stateV2.json",
        "utf-8"
      )
    );

    for (const version of Object.keys(migrations).sort()) {
      state = migrations[version]!(state);
      const snapshotName = `./migrationTestStates/stateV${
        parseInt(version) + 1
      }.json`;
      await expect(stableStringify(state)).toMatchFileSnapshot(
        snapshotName,
        snapshotName
      );
    }
  });
});
