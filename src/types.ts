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
