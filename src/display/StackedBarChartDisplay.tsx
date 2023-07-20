import { Tooltip } from "antd";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from "recharts";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";
import { getColor } from "../util/utils";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const StackedBarChart: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  return (
    <>
      <BarChart
        width={500}
        height={300}
        data={transformResult}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={transformConfig.labelColumn} />
        <YAxis />
        <Tooltip />
        <Legend />
        {transformConfig.selectedColumns.map((col, i) => (
          <Bar key={i} dataKey={col} stackId="a" fill={getColor(i)} />
        ))}
      </BarChart>
    </>
  );
};

export default StackedBarChart;
