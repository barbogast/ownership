import { Table } from "antd";
import { DataType } from "../types";
import { QueryExecResult } from "../Db";

type Props = {
  queryResult: QueryExecResult;
};

const QueryTable: React.FC<Props> = ({ queryResult }) => {
  return (
    <Table<DataType>
      columns={queryResult.columns.map((col) => ({
        title: col,
        dataIndex: col,
        key: col,
      }))}
      rowSelection={{
        type: "checkbox",
        // onChange: (_, selectedDataSets) => {
        //   setSelected(selectedDataSets);
        // },
        checkStrictly: true,
      }}
      // @ts-expect To fix this DataType would need to be build dynamically from queryResult.columns
      dataSource={queryResult.values.map((row, i) => ({
        ...Object.fromEntries(queryResult.columns.map((k, i) => [k, row[i]])),
        key: i,
      }))}
    />
  );
};

export default QueryTable;
