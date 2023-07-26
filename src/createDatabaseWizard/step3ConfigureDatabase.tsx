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
            key="asdf"
            value={results.name}
            onChange={(event) =>
              setResults((results) => ({
                ...results,
                name: event.target.value,
              }))
            }
            addonBefore="Database name"
            disabled={isExistingDb}
          />
        </Space>
      );
    },
    onNext: (results) => {
      const databaseDefinition = {
        name: results.name,
        id: results.name,
        csvContent: Papa.unparse(results.parsedCsvContent),
        tableName: results.tableName,
        columns: results.columns,
      };

      if (isExistingDb) {
        updateDatabaseDefinition(results.name, databaseDefinition);

        // Force recreating the database with new data
        deleteConnection(results.name);
      } else {
        addDatabaseDefinition(databaseDefinition);
        const basepath = getBasePath();
        window.history.pushState(null, "", `${basepath}/db/${results.name}`);
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
