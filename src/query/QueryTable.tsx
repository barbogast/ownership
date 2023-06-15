import { Table } from "antd";

type DataType = Record<string, unknown>;
type Props = {
  columns: string[];
  values: DataType[];
};

const QueryTable: React.FC<Props> = ({ columns, values }) => {
  return (
    <Table<DataType>
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
      dataSource={values}
    />
  );
};

export default QueryTable;
