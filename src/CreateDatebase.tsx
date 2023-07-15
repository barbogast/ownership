import React, { useState } from "react";
import { Input, Button, Col, Row, Select } from "antd";
import Papa from "papaparse";

import Logger from "./util/logger";
import { addDatabaseDefinition } from "./databaseDefinitionStore";
import { analyzeCsvHeader } from "./util/csv";
import { ColumnDefinition } from "./util/database";
import { testTable } from "./testData/databases";

const csvLogger = new Logger("csv");
const sqlLogger = new Logger("sql");

const DEBUG = true;
const initialValues = DEBUG
  ? {
      csv: testTable.csvContent,
      tableName: "aaa",
      query: "select * from aaa",
    }
  : {
      csv: "",
      tableName: "",
      query: "",
    };

type Progress = {
  parsed?: boolean;
  imported?: boolean;
  queried?: boolean;
};

const CreateDatabase2: React.FC = () => {
  const [progress, setProgress] = useState<Progress>({});
  const [csvText, setCsvText] = useState(initialValues.csv);
  const [tableName, setTableName] = useState(initialValues.tableName);
  const [columns, setColumns] = useState<ColumnDefinition[]>([]);
  const [dbName, setDbName] = useState("");

  const [error, setError] = useState<Error>();

  const parseCsv = csvLogger.time("parseCsv", () => {
    try {
      const result = Papa.parse<string[]>(csvText);
      setColumns(analyzeCsvHeader(result.data));
      setProgress({ parsed: true });
    } catch (err) {
      console.error(err);
      setError(err as Error);
    }
  });

  const saveDatabase = sqlLogger.time("insertTable", async () => {
    // TODO: validate that dbName only contains letters, numbers and -
    addDatabaseDefinition(dbName, csvText, tableName, columns);
  });

  return (
    <div style={{ display: "block", flexDirection: "column" }}>
      <Input.TextArea
        value={csvText}
        onChange={(event) => setCsvText(event.target.value)}
        styles={{ textarea: { fontFamily: "monospace" } }}
        rows={20}
      />
      <br />
      <br />
      <Button onClick={parseCsv} type="primary">
        Parse
      </Button>
      <br />
      <br />
      {progress.parsed && (
        <>
          <Input
            addonBefore="Table name"
            value={tableName}
            onChange={(event) => setTableName(event.target.value)}
          />
          <br />
          <br />
          <br />
          <Row>
            <Col span={8}>
              <strong>Column name in CSV</strong>
            </Col>
            <Col span={8}>
              <strong>Column name in database</strong>
            </Col>
            <Col span={8}>
              <strong>Data type in database</strong>
            </Col>
          </Row>
          <br />
          {columns.map((col, i) => (
            <Row key={col.dbName + i}>
              <Col span={8}>{col.csvName}</Col>
              <Col span={8}>
                <Input
                  value={col.dbName}
                  onChange={(event) => {
                    col.dbName = event.target.value;
                  }}
                  style={{ width: 250 }}
                />
              </Col>
              <Col span={8}>
                <Select
                  value={col.type}
                  onChange={(value) => {
                    setColumns((state) =>
                      state.map((c, i2) =>
                        i === i2 ? { ...c, type: value } : c
                      )
                    );
                  }}
                  style={{ width: 250 }}
                >
                  <option value="integer">Integer</option>
                  <option value="real">Real</option>
                  <option value="text">Text</option>
                </Select>
              </Col>
              <br />
              <br />
              <br />
            </Row>
          ))}
          <Input
            value={dbName}
            onChange={(event) => setDbName(event.target.value)}
            addonBefore="Database name"
          />
          <Button onClick={saveDatabase} type="primary">
            Save
          </Button>
          <br />
        </>
      )}
      <br />
      <br />

      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>
    </div>
  );
};

export default CreateDatabase2;
