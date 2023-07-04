import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { COLORS } from "../constants";
import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";

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
      <LineChart
        width={500}
        height={300}
        data={transformResult}
        margin={{
          top: 5,
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

        {Object.keys(transformResult[0])
          .filter((c) => transformConfig.selectedColumns.indexOf(c) !== -1)
          .map((c, i) => (
            <Line key={i} type="monotone" dataKey={c} stroke={COLORS[i]} />
          ))}
      </LineChart>
    </>
  );
};

export default LineChartDisplay;
