import { Select } from "antd";

import { updateQuery, Query, updateTransformConfig } from "../queryStore";
import { TransformResult } from "../../types";
import ChartDisplay, { SINGLE_DATASET_CHART_TYPES } from "../../display/Index";

type Props = {
  query: Query;
  transformResult: TransformResult;
};

const DisplaySection: React.FC<Props> = ({ query, transformResult }) => {
  const { labelColumn, dataRowIndex } = query.transformConfig;

  return (
    <>
      <Select
        value={query.chartType}
        onChange={(chartType) => updateQuery(query.id, { chartType })}
        options={[
          { value: "barChart", label: "Bar chart" },
          { value: "stackedBarChart", label: "Stacked Bar chart" },
          { value: "pieChart", label: "Pie chart" },
          { value: "stackedPieChart", label: "Stacked Pie chart" },
          { value: "lineChart", label: "Line chart" },
          { value: "timeSeriesDayChart", label: "Time series day chart" },
          { value: "table", label: "Table" },
        ]}
        style={{ width: 200 }}
      />
      <br />
      {query.chartType &&
        SINGLE_DATASET_CHART_TYPES.includes(query.chartType) &&
        transformResult.length > 1 && (
          <>
            <br />
            Row to display:{" "}
            <Select
              value={dataRowIndex}
              onChange={(value) =>
                updateTransformConfig(query.id, { dataRowIndex: value })
              }
              options={transformResult.map((row, i) => ({
                value: i,
                label:
                  `Row ${i + 1}` +
                  (labelColumn !== "--no-label-column--"
                    ? `: ${row[labelColumn]}`
                    : ""),
              }))}
              style={{ width: 220 }}
            />
          </>
        )}
      <br />
      <br />

      <ChartDisplay query={query} transformResult={transformResult} />
    </>
  );
};

export default DisplaySection;
