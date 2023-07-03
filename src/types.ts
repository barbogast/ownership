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

export type TransformResult = Record<string, unknown>[];

export type ChartProps = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
