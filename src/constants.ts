import { editor } from "monaco-editor";

export const COLORS = [
  "red",
  "blue",
  "green",
  "black",
  "grey",
  "purple",
  "orange",
  "yellow",
];

export const databaseFiles = [
  "database.sqlite",
  "database2.sqlite",
  "database3.sqlite",
  "database4.sqlite",
];

export const editorDefaultOptions: editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true,
  };
