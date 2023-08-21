import React, { useEffect, useState } from "react";

import ChartDisplay from "../src/display/Index";
import { TransformResult } from "../src/types";
import { Query } from "../src/query/queryStore";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const repoPath = "barbogast/ownership-test-repo";

const ReportDisplay: React.FC<Props> = ({ queryId }) => {
  const [query, setQuery] = useState<Query>();
  const [transformResult, setTransformResult] = useState<TransformResult>();

  useEffect(() => {
    fetch(
      `https://raw.githubusercontent.com/${repoPath}/main/queries/${queryId}/index.json`
    )
      .then((res) => res.json())
      .then(setQuery);

    fetch(`data.json`)
      .then((res) => res.json())
      .then((res) => setTransformResult(res.transformResult));
  }, [queryId]);

  if (!query || !transformResult) {
    return;
  }

  return <ChartDisplay query={query} transformResult={transformResult} />;
};

export default ReportDisplay;
