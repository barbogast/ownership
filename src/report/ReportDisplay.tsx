import React from "react";

import { Link } from "wouter";
import useQueryController from "../useQueryController";
import ChartDisplay from "../display/Index";
import { useQuery } from "../query/queryStore";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  const { error, transformResult } = useQueryController(queryId);
  const query = useQuery(queryId);

  return (
    <>
      <pre style={{ color: "red" }}>{(error || "").toString()}</pre>

      <ChartDisplay query={query} transformResult={transformResult} />

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
