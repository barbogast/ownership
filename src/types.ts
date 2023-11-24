import { TransformConfig } from "./query/queryStore";

export type DataType = {
  key: string;
  name: string;
  value: string;
  children?: DataType[];
};

export type BarChartTableDataType = {
  name: string;
  key: string;
  children?: BarChartTableDataType[];
};

export type Value = string | number | null;
export type DataRow = Record<string, Value>;
export type TransformResult = DataRow[];

export type ChartProps = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};

export type RepositoryInfo = {
  organization: string;
  repository: string;
  path: string;
};
