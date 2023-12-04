import { useEffect, useState } from "react";
import { VegaLite, VisualizationSpec } from "react-vega";
import { Editor } from "@monaco-editor/react";
import useLocalSettingsStore from "../localSettingsStore";
import ErrorBoundary from "../components/ErrorBoundary";
import { TransformResult } from "../types";
import { updateChartConfig } from "../query/queryStore";
import { Panel, PanelGroup } from "react-resizable-panels";
import { VegaChartProps } from "./Index";
import { Alert } from "antd";

type Props = {
  transformResult: TransformResult;
  chartConfig: VegaChartProps;
  queryId: string;
};

const VegaChart = ({ transformResult, chartConfig, queryId }: Props) => {
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );

  const [error, setError] = useState<Error>();
  const [spec, setSpec] = useState<VisualizationSpec>();

  useEffect(() => {
    try {
      const parsedSpec = JSON.parse(chartConfig.vegaSpec) as VisualizationSpec;
      setSpec(parsedSpec);
      setError(undefined);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  }, [chartConfig.vegaSpec]);

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSizePercentage={50} minSizePercentage={10}>
        <Editor
          defaultLanguage={"json"}
          defaultValue={chartConfig.vegaSpec}
          options={{ automaticLayout: true }}
          onChange={(value) =>
            updateChartConfig(queryId, { vegaSpec: value as string })
          }
          theme={darkModeEnabled ? "vs-dark" : undefined}
          height={"700px"}
        />
      </Panel>
      <Panel minSizePercentage={10}>
        {error && <Alert type="error" message={error.toString()} />}
        {spec && (
          <ErrorBoundary>
            <VegaLite
              data={{ table: transformResult }}
              spec={spec}
              onError={(e) => setError(e)}
              style={{ width: "100%" }}
            />
          </ErrorBoundary>
        )}
      </Panel>
    </PanelGroup>
  );
};

export default VegaChart;
