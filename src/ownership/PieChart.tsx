import React from "react";
import { PieChart, Pie } from "recharts";
import { DataType } from "../types";

type Props = {
  data: DataType;
};

const Chart: React.FC<Props> = ({ data }) => {
  if (!data) {
    return null;
  }

  console.log("chart", data.children);

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data.children?.map((x) => ({
          label: x.name,
          value: parseInt(x.value),
        }))}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={60}
        fill="#8884d8"
        label
      />
    </PieChart>
  );
};

export default Chart;
