import { Table } from "antd";
import { DataType } from "../types";

type Props = {
  data: DataType[];
};

const QueryTable2: React.FC<Props> = ({ data }) => {
  return (
    <Table<DataType>
      columns={[
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Value",
          dataIndex: "value",
          key: "value",
        },
      ]}
      rowSelection={{
        type: "checkbox",
        // onChange: (_, selectedDataSets) => {
        //   setSelected(selectedDataSets);
        // },
        checkStrictly: true,
      }}
      dataSource={data}
    />
  );
};

export default QueryTable2;
