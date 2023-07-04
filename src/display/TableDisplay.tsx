import { Table } from "antd";
import { ChartProps } from "../types";

type DataType = Record<string, unknown>;

const recursivelyAddKeyProp = <T extends Record<string, unknown>>(
  arr: T[],
  level: number
): T[] =>
  arr.map((obj, i) => ({
    ...obj,
    key: `row-${level}-${i}`,
    ...("children" in obj && Array.isArray(obj.children)
      ? { children: recursivelyAddKeyProp(obj.children, level + 1) }
      : {}),
  }));

const QueryTable: React.FC<Pick<ChartProps, "transformResult">> = ({
  transformResult,
}) => {
  const columns = Object.keys(transformResult[0]).map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
  }));

  return (
    <Table<DataType>
      scroll={{ x: true }}
      columns={columns}
      rowSelection={
        "children" in transformResult[0]
          ? {
              type: "checkbox",
              // onChange: (_, selectedDataSets) => {
              //   setSelected(selectedDataSets);
              // },
              checkStrictly: true,
            }
          : undefined
      }
      // @ts-expect To fix this DataType would need to be build dynamically from queryResult.columns
      dataSource={recursivelyAddKeyProp(transformResult, 1)}
      size="small"
      bordered
    />
  );
};

export default QueryTable;
