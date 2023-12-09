import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

import { TransformResult } from "../types";
import { TransformConfig } from "../query/queryStore";
import { getColor } from "../util/utils";

type Props = {
  transformResult: TransformResult;
  transformConfig: TransformConfig;
};

const TimeSeriesDaysDisplay: React.FC<Props> = ({
  transformResult,
  transformConfig,
}) => {
  const data = transformResult as { timestamp: number }[];

  const referenceAreas = data
    // Get all entries at midnight
    .filter((entry) => {
      const date = new Date(entry.timestamp * 1000);
      return date.getHours() === 0 && date.getMinutes() === 0;
    })
    // Create pairs of timestamps representing the boundaries of each <ReferenceArea />
    .reduce<{ x1: number; x2: number }[]>((acc, entry, index, allEntries) => {
      if (acc.length === 0) {
        // First entry
        return [{ x1: data[0]!.timestamp, x2: entry.timestamp }];
      } else if (index === allEntries.length - 1) {
        // Last 2 entries
        return [
          ...acc,
          { x1: acc.at(-1)!.x2, x2: entry.timestamp },
          { x1: entry.timestamp, x2: data.at(-1)!.timestamp },
        ];
      } else {
        return [...acc, { x1: acc.at(-1)!.x2, x2: entry.timestamp }];
      }
    }, []);

  const ticks = data
    .filter((entry) => {
      const date = new Date(entry.timestamp * 1000);
      return date.getHours() % 4 === 0 && date.getMinutes() === 0;
    })
    .map((entry) => entry.timestamp);

  return (
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey={"timestamp"}
          tickFormatter={(value) =>
            new Date(value * 1000).getHours().toString()
          }
          ticks={ticks}
        />

        <XAxis
          dataKey="timestamp"
          tick={(tickProps) => {
            // https://recharts.org/en-US/examples/BarChartWithMultiXAxis
            const { x, y, payload } = tickProps;
            const { value } = payload as { value: number };

            const date = new Date(value * 1000);

            // Date labels (i.e. 2023-11-08) at noon
            if (date.getHours() === 12 && date.getMinutes() === 0) {
              const strDate = date.toISOString().split("T")[0];
              return (
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  // Same as https://github.com/recharts/recharts/blob/336d15b9d483fcadd35e2eb73ec0619b68b77f2b/src/cartesian/CartesianAxis.tsx#L79
                  fill={"#666"}
                >
                  {strDate}
                </text>
              );
            }

            return <></>;
          }}
          axisLine={false}
          tickLine={false}
          interval={1}
          height={1}
          xAxisId="date"
        />

        <YAxis />

        {referenceAreas.map((area, index) => (
          <ReferenceArea
            key={index}
            x1={area.x1}
            x2={area.x2}
            fill={index % 2 === 0 ? "#8884d8" : "red"}
            fillOpacity={0.1}
          />
        ))}

        <Tooltip
          labelFormatter={(value) => {
            const date = new Date(value * 1000);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date
              .getHours()
              .toString()
              .padStart(2, "0")}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
          }}
        />

        <Legend wrapperStyle={{ paddingTop: 30 }} />

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
  );
};

export default TimeSeriesDaysDisplay;
