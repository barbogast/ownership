import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";
import { getColor } from "../util/utils";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const LineChartDisplay: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  return (
    <>
      X axis: <br />
      <br />
      <ResponsiveContainer>
        <LineChart
          width={1000}
          height={300}
          data={transformResult}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={transformConfig.labelColumn} />
          <YAxis />
          <Tooltip />
          <Legend />

          {transformConfig.selectedColumns.map((c, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={c}
              stroke={getColor(i)}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default LineChartDisplay;
