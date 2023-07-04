import React from "react";

import { Link } from "wouter";
import useQueryController from "../useQueryController";
import ChartDisplay from "../display/Index";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  const { error, transformResult } = useQueryController(queryId);

  return (
    <>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>

      <ChartDisplay queryId={queryId} transformResult={transformResult} />

      {showEditLink && (
        <div style={{ textAlign: "right" }}>
          <Link href={`/query/${queryId}`}>
            <button>Edit</button>
          </Link>
        </div>
      )}
    </>
  );
};

export default Chart;
