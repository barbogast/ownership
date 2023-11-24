import { TransformResult } from "../types";
import { executeTypescriptCode } from "./util";

export type Parameters = Record<string, never>; // Empty object

export type ReturnValue = TransformResult;

export const execute = (code: string) =>
  executeTypescriptCode<ReturnValue>(code, "execute", {});

export const defaultCode = `
type Value = string | number | null | undefined
type Row = Record<string, Value>
type ReturnValue = Row[]

function execute(): ReturnValue | Promise<ReturnValue> {
  // Your code here ...
  return []
}
`;
