import { TransformResult } from "../types";
import { executeTypescriptCode } from "./util";

export type Parameters = { queryResults: TransformResult[] };

export type ReturnValue = TransformResult;

export const execute = (code: string, parameters: Parameters) =>
  executeTypescriptCode<ReturnValue>(code, "transform", parameters);

export const defaultCode = `
type Value = string | number | null | Row[]
type Row = Record<string, Value>
type Table = Row[]

function transform(tables: Table[]): Table {
  // Your code here ...
  return tables[0]
}
`;
