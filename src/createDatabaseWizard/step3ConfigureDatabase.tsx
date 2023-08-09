import { Input, Space } from "antd";
import Papa from "papaparse";

import { Step } from "../wizard/types";
import { StepResult } from "./types";
import {
  addDatabaseDefinition,
  updateDatabaseDefinition,
} from "../databaseDefinition/databaseDefinitionStore";
import { getBasePath } from "../util/utils";
import { deleteConnection } from "../databaseConnectionStore";

const getStep = (isExistingDb: boolean) => {
  const step: Step<StepResult> = {
    type: "component",
    label: "Configure Database",
    component: ({ results, setResults }) => {
      return (
        <Space direction="vertical" size="large">
          <Input
            addonBefore="Table name"
            value={results.tableName}
            onChange={(event) =>
              setResults((state) => ({
                ...state,
                tableName: event.target.value,
              }))
            }
          />

          <Input
            value={results.label}
            onChange={(event) =>
              setResults((results) => ({
                ...results,
                label: event.target.value,
              }))
            }
            addonBefore="Database label"
          />
        </Space>
      );
    },
    onNext: (results) => {
      const databaseDefinition = {
        id: results.id,
        label: results.label,
        csvContent: Papa.unparse(results.parsedCsvContent, { newline: "\n" }),
        tableName: results.tableName,
        columns: results.columns,
      };

      if (isExistingDb) {
        updateDatabaseDefinition(results.id, databaseDefinition);

        // Force recreating the database with new data
        deleteConnection(results.id);
      } else {
        const id = addDatabaseDefinition(databaseDefinition);
        const basepath = getBasePath();
        window.history.pushState(null, "", `${basepath}/db/${id}`);
      }
      return results;
    },
    nextButton: {
      type: "primary",
      label: isExistingDb ? "Update database" : "Add new database",
    },
  };

  return step;
};

export default getStep;
