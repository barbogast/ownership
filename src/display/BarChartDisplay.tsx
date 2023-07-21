import { BarChart, Bar, Tooltip, YAxis, XAxis, Cell } from "recharts";

import { ChartProps } from "../types";
import { getColor } from "../util/utils";

const BarChartDisplay: React.FC<ChartProps> = ({
  transformResult,
  transformConfig,
}) => {
  return (
    <BarChart
      width={500}
      height={250}
      data={transformResult.filter(
        ({ label }) => label !== transformConfig.labelColumn
      )}
    >
      <Bar dataKey="value">
        {transformResult.map((_, i) => (
          <Cell fill={getColor(i)} key={i} />
        ))}
      </Bar>

      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
    </BarChart>
  );
};

export default BarChartDisplay;
