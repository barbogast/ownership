import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChartTableDataType, DataType } from "./types";
import BarChartTable from "./BarChartTable";
import { useState } from "react";

type Props = {
  data: DataType[];
};
const MyBarChart: React.FC<Props> = ({ data }) => {
  const [selected, setSelected] = useState<BarChartTableDataType[]>([]);

  const chartData = data.map((item) => ({
    name: item.name,
    residents: item?.children![0].children?.find(
      (subItem) => subItem.name === "Residents"
    )!.value,
    nonResidents: item?.children![0].children?.find(
      (subItem) => subItem.name === "Non-residents"
    )!.value,
  }));

  return (
    <>
      <BarChartTable setSelected={setSelected} />

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="residents" stackId="a" fill="#8884d8" />
          <Bar dataKey="nonResidents" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default MyBarChart;
