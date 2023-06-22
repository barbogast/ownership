import { Table } from "antd";

type DataType = Record<string, unknown>;
type Props = {
  columns: string[];
  values: DataType[];
};

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

const QueryTable: React.FC<Props> = ({ columns, values }) => {
  return (
    <Table<DataType>
      scroll={{ x: true }}
      columns={columns
        .filter((col) => col !== "children")
        .map((col) => ({
          title: col,
          dataIndex: col,
          key: col,
        }))}
      rowSelection={
        columns.includes("children")
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
      dataSource={recursivelyAddKeyProp(values, 1)}
      size="small"
    />
  );
};

export default QueryTable;
