import { executeTypescriptCode } from "./util";

type Row = string[];
type FileContent = {
  header: Row;
  data: Row[];
};
export type Input = Record<string, FileContent>;
export type Parameters = { files: Input };

export type ReturnValue = FileContent;

export const execute = (code: string, params: Parameters) =>
  executeTypescriptCode<ReturnValue>(code, "postProcess", params);

export const initialCode = `
type Row = string[]
type FileContent = {
    header: Row // Empty array if the csv file has no header
    data: Row[]
}
type Files = Record<string, FileContent>

function postProcess(files: Files): FileContent | Promise<FileContent> {
  // Your code here ...
  return {
    header: [],
    data: [],
  }
}
`;
