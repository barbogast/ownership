import React, { useState } from "react";
import { Space, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataType } from "./types";

const columns: ColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
    width: "12%",
  },
];

type Props = {
  data: DataType[];
  setSelected: (id: DataType) => void;
};

const MyTable: React.FC<Props> = ({ setSelected, data }) => {
  return (
    <>
      <Table
        columns={columns}
        rowSelection={{
          type: "radio",
          onSelect: setSelected,
          checkStrictly: true,
        }}
        dataSource={data}
      />
      7
    </>
  );
};

export default MyTable;
