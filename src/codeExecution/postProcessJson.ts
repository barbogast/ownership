import { TransformResult } from "../types";
import { executeTypescriptCode } from "./util";

export type Input = Record<string, unknown>;
export type Parameters = { files: Input };

export type ReturnValue = TransformResult;

export const execute = (code: string, params: Parameters) =>
  executeTypescriptCode<ReturnValue>(code, "postProcess", params);

export const initialCode = `
type Value = string | number | null | undefined
type Row = Record<string, Value>

// TODO: Specify the actual type of the JSON data here
type Data = unknown

type Filename = string
type Files = Record<string, Data>

type ReturnValue = Row[]

function postProcess(files: Files): ReturnValue | Promise<ReturnValue> {
  // Flatten all files into a single array of rows
  return []
}
`;
