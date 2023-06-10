import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BarChartTableDataType } from "./types";

const columns: ColumnsType<BarChartTableDataType> = [
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

const data: BarChartTableDataType[] = [
  {
    key: "total",
    name: "Total",
    children: [
      {
        key: "residents",
        name: "Residents",
        children: [
          {
            key: "centralBank",
            name: "Central Bank",
          },
          {
            key: "omfis",
            name: "OMFIs",
          },
          {
            key: "otherFinancialInsitutions",
            name: "Other Financial Instituions",
          },
          {
            key: "otherResidents",
            name: "Other Residents",
          },
        ],
      },
      {
        key: "nonResidents",
        name: "Non-residents",
      },
    ],
  },
];

type Props = {
  setSelected: (id: BarChartTableDataType[]) => void;
};

const BarChartTable: React.FC<Props> = ({ setSelected }) => {
  return (
    <>
      <Table<BarChartTableDataType>
        columns={columns}
        rowSelection={{
          type: "radio",
          onChange: (_, selectedDataSets) => {
            setSelected(selectedDataSets);
          },
          checkStrictly: true,
        }}
        defaultExpandAllRows={true}
        dataSource={data}
        expandable={{
          expandIcon: () => null,
        }}
      />
      7
    </>
  );
};

export default BarChartTable;
