import { TransformResult } from "../types";
import { executeTypescriptCode } from "../util/codeExecution";

export type Parameters = { data: unknown };

export type ReturnValue = TransformResult;

export const execute = (code: string, params: Parameters) =>
  executeTypescriptCode<ReturnValue>(code, "postProcess", params);

export const defaultCode = `
type Value = string | number | null | undefined
type Row = Record<string, Value>
type ReturnValue = Row[]

// Specify the actual type of the JSON data here
type Data = unknown

function postProcess(data: Data): ReturnValue | Promise<ReturnValue> {
  // Your code here ...
  return []
}
`;
