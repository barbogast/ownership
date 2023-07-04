import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";
import { getColor } from "../utils";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};
const LineChartDisplay: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  const lines = Object.keys(transformResult[0]).filter(
    (c) => transformConfig.selectedColumns.indexOf(c) !== -1
  );

  return (
    <>
      X axis: <br />
      <br />
      <LineChart
        width={500}
        height={300}
        data={transformResult}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={transformConfig.labelColumn} />
        <YAxis />
        <Tooltip />
        <Legend />

        {lines.map((c, i) => (
          <Line key={i} type="monotone" dataKey={c} stroke={getColor(i)} />
        ))}
      </LineChart>
    </>
  );
};

export default LineChartDisplay;
