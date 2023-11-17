import { executeTypescriptCode } from "../util/codeExecution";

export type Parameters = { rows: string[][] };

export type ReturnValue = string[][];

export const execute = (code: string, params: Parameters) =>
  executeTypescriptCode<ReturnValue>(code, "postProcess", params);

export const defaultCode = `
type Rows = string[][]

function postProcess(rows: Rows): Rows | Promise<Rows> {
  // Your code here ...
  return rows
}
`;
