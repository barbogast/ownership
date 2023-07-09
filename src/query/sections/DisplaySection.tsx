import { Select } from "antd";

import useQueryStore, { useQuery, updateQuery } from "../queryStore";
import { TransformResult } from "../../types";
import ChartDisplay from "../../display/Index";

type Props = {
  queryId: string;
  transformResult: TransformResult;
};

const DisplaySection: React.FC<Props> = ({ queryId, transformResult }) => {
  const { chartType, transformConfig } = useQuery(queryId);

  const { labelColumn, dataRowIndex } = transformConfig;

  return (
    <>
      <Select
        value={chartType}
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
      {(chartType === "barChart" || chartType === "pieChart") &&
        transformResult.length > 1 && (
          <>
            <br />
            Row to display:{" "}
            <Select
              value={dataRowIndex}
              onChange={(value) => {
                useQueryStore.setState((state) => {
                  state.queries[queryId].transformConfig.dataRowIndex = value;
                });
              }}
              options={transformResult.map((row, i) => ({
                value: i,
                label: `Row ${i + 1}: "${row[labelColumn]}"`,
              }))}
              style={{ width: 220 }}
            />
          </>
        )}
      <br />
      <br />

      <ChartDisplay queryId={queryId} transformResult={transformResult} />
    </>
  );
};

export default DisplaySection;
