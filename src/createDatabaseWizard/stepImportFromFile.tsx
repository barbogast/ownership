import { forwardRef, useRef, useImperativeHandle, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { Alert, Button, Col, Input, Popconfirm, Row } from "antd";

import { Step } from "../components/wizard/types";
import { StepName, StepResult } from "./types";
import useLocalSettingsStore from "../localSettingsStore";
import { Source } from "../databaseDefinition/databaseDefinitionStore";
import * as csv from "../util/csv";
import * as json from "../util/json";
import { DataRow } from "../types";
import { createId } from "../util/utils";

const sourceTypeToFileExtension: Record<Source, string> = {
  csv: "csv",
  json: "json",
  code: "unused",
};

const sourceTypeToMonacoLanguage: Record<Source, string> = {
  csv: "csv",
  json: "json",
  code: "unused",
};

const useFileController = (existingFileNames: string[], sourceType: Source) => {
  const extension = sourceTypeToFileExtension[sourceType];
  const [fileNames, setFileNames] = useState<{ name: string; id: string }[]>(
    existingFileNames.length > 0
      ? // We need to make sure that all pre-existing files have the correct extension.
        // The user might have started with a different source type (i.e. json), added some files
        // and then went back and chose a different source type (i.e. csv).
        existingFileNames
          .filter((name) => name.split(".")[1] === extension)
          .map((name) => ({ name, id: createId() }))
      : [{ name: `file1.${extension}`, id: createId() }]
  );

  // This is used to generate a file name when adding a new file.
  // Using `files.length` instead can lead to duplicate file names after the user removes a file.
  const [fileNameIndex, setFileNameIndex] = useState<number>(
    existingFileNames.length + 1
  );

  const editorRef = useRef<Record<string, editor.IStandaloneCodeEditor>>({});

  return {
    fileNames,

    setFileName: (id: string, newName: string) =>
      setFileNames((files) =>
        files.map((file) =>
          file.id === id ? { ...file, name: newName } : file
        )
      ),

    addFile: () => {
      setFileNames((files) => [
        ...files,
        { name: `file${fileNameIndex + 1}.${extension}`, id: createId() },
      ]);
      setFileNameIndex((index) => index + 1);
    },

    addEditorRef: (id: string, editor: editor.IStandaloneCodeEditor) => {
      editorRef.current[id] = editor;
    },

    deleteFile: (id: string) => {
      setFileNames((files) => files.filter((file) => file.id !== id));
      delete editorRef.current[id];
    },

    getFileContents: () =>
      Object.fromEntries(
        fileNames.map((file) => [
          file.name,
          // On windows text created in <textarea> and similar elements uses \r\n as line breaks.
          // We convert them to \n to have consistent line breaks across platforms.
          editorRef.current![file.id]!.getValue().replace(/\r\n/g, "\n"),
        ])
      ),
  };
};

const getStep = () => {
  const step: Step<StepName, StepResult> = {
    type: "forwardRefComponent",
    label: "Import from files",
    nextStep: {
      resultKey: "enablePostProcessing",
      resultValueMappings: [
        { value: true, stepName: "postProcessing" },
        { value: false, stepName: "configureColumns" },
      ],
    },
    forwardRefComponent: forwardRef(({ results }, parentRef) => {
      const existingFileNames = Object.keys(results.sourceFiles);
      const fileController = useFileController(
        existingFileNames,
        results.source
      );
      const darkModeEnabled = useLocalSettingsStore(
        (state) => state.darkModeEnabled
      );

      // useImperativeHandle is used to defer updating `results.sourceFiles` to when the step is submitted.
      // Writing to `results.sourceFiles` in the onKeyPress event handler of the editor would result in
      // state updates (and writes to IndexedDB) on every key press, which might be slow if there are many/big files.
      useImperativeHandle(parentRef, () => ({
        getResult: (results) => ({
          ...results,
          sourceFiles: fileController.getFileContents(),
        }),
      }));

      const multipleFiles = fileController.fileNames.length > 1;
      return (
        <>
          {fileController.fileNames.map((file) => (
            <Row key={file.id} gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {multipleFiles && (
                <Col span={4}>
                  <Input
                    data-testid="file-name-input"
                    value={file.name}
                    onChange={(event) =>
                      fileController.setFileName(file.id, event.target.value)
                    }
                  />
                </Col>
              )}
              <Col span={multipleFiles ? 19 : 24}>
                <div>
                  <Editor
                    height="200px"
                    defaultLanguage={sourceTypeToMonacoLanguage[results.source]}
                    defaultValue={results.sourceFiles[file.name] ?? ""}
                    onMount={(editor) => {
                      fileController.addEditorRef(file.id, editor);

                      // Don't propagate keyboard events to the parent element. This solves the issue of
                      // antd's modal rerendering its content when `okType="primary"` and the user presses Enter.
                      editor
                        .getDomNode()!
                        .addEventListener("keydown", (event) => {
                          if (event.key === "Enter") {
                            event.stopPropagation();
                          }
                        });
                    }}
                    theme={darkModeEnabled ? "vs-dark" : undefined}
                  />
                </div>
              </Col>
              {multipleFiles && (
                <Col span={1}>
                  <Popconfirm
                    title={`Are you sure you want to remove "${file.name}"?`}
                    onConfirm={() => fileController.deleteFile(file.id)}
                  >
                    <Button danger title="Remove file">
                      x
                    </Button>
                  </Popconfirm>
                </Col>
              )}
            </Row>
          ))}
          <Button onClick={fileController.addFile}>Add file</Button>
          <br />
          <br />
          {multipleFiles && (
            <Alert
              message="Note that all files must have the same structure (data types,
            properties, etc.)"
              type="info"
            />
          )}
        </>
      );
    }),
    submitStep: (results: StepResult) => {
      if (results.source === "json") {
        const parsedFiles = json.parseSourceFiles(results.sourceFiles);
        if (results.enablePostProcessing) {
          return {
            ...results,
            json: { beforePostProcessing: parsedFiles },
          };
        } else {
          return {
            ...results,
            json: { finalContent: json.mergeFiles<DataRow>(parsedFiles) },
          };
        }
      } else if (results.source === "csv") {
        const csvFiles = csv.parseSourceFiles(results.sourceFiles);

        if (results.enablePostProcessing) {
          return {
            ...results,
            csv: { beforePostProcessing: csvFiles },
          };
        } else {
          // TODO: Make sure that all csv files have the same columns
          return {
            ...results,
            csv: { finalContent: csv.mergeFiles(csvFiles) },
          };
        }
      } else {
        throw new Error(`Unsupported source type: ${results.source}`);
      }
    },
  };
  return step;
};

export default getStep;
