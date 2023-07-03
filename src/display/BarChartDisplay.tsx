import { BarChart, Bar, Legend, Tooltip, YAxis, XAxis, Cell } from "recharts";

import { ChartProps } from "../types";
import { getColor } from "../utils";

const BarChartDisplay: React.FC<Pick<ChartProps, "transformResult">> = ({
  transformResult,
}) => {
  return (
    <BarChart width={500} height={250} data={transformResult}>
      <Bar dataKey="value">
        {transformResult.map((_, i) => (
          <Cell fill={getColor(i)} key={i} />
        ))}
      </Bar>

      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </BarChart>
  );
};

export default BarChartDisplay;
