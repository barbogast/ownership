import { Select } from "antd";

import useQueryStore, { useQuery, updateQuery } from "../queryStore";
import { TransformResult } from "../../types";
import ChartDisplay, { SINGLE_DATASET_CHART_TYPES } from "../../display/Index";

type Props = {
  queryId: string;
  transformResult: TransformResult;
};

const DisplaySection: React.FC<Props> = ({ queryId, transformResult }) => {
  const query = useQuery(queryId);

  const { labelColumn, dataRowIndex } = query.transformConfig;

  return (
    <>
      <Select
        value={query.chartType}
        onChange={(chartType) => updateQuery(queryId, { chartType })}
        options={[
          { value: "barChart", label: "Bar chart" },
          { value: "stackedBarChart", label: "Stacked Bar chart" },
          { value: "pieChart", label: "Pie chart" },
          { value: "stackedPieChart", label: "Stacked Pie chart" },
          { value: "lineChart", label: "Line chart" },
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
              onChange={(value) => {
                useQueryStore.setState((state) => {
                  state[queryId].transformConfig.dataRowIndex = value;
                });
              }}
              options={transformResult.map((row, i) => ({
                value: i,
                label:
                  `Row ${i + 1}` +
                  (labelColumn !== "--no-label-column--"
                    ? ` ${row[labelColumn]}`
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
