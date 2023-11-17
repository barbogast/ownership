import { TransformResult } from "../types";
import { executeTypescriptCode } from "./util";
import { ColumnType } from "../util/database";

export type Parameters = Record<string, never>; // Empty object

export type ReturnValue = {
  data: TransformResult;
  columns: { name: string; type: ColumnType }[];
};

export const execute = (code: string) =>
  executeTypescriptCode<ReturnValue>(code, "postProcess", {});

export const defaultCode = `
type Value = string | number | null | undefined
type Row = Record<string, Value>
type Columns = { name: string, type: "text" | "integer" | "real" }[]
type ReturnValue = {data: Row[], columns: Columns}

function execute(): ReturnValue | Promise<ReturnValue> {
  // Your code here ...
  return {data: [], columns: []}
}
`;
