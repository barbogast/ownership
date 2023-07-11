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

export const editorDefaultOptions: editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true,
  };
