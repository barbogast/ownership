import React from "react";

import { Link } from "wouter";
import useQueryController from "../useQueryController";
import ChartDisplay from "../display/Index";
import { Query, useQuery } from "../query/queryStore";
import InjectFromStore from "../components/InjectFromStore";

type Props = {
  queryId: string;
  showEditLink: boolean;
};

const Inner: React.FC<{ query: Query }> = ({ query }) => {
  const { transformResult } = useQueryController(query);
  return transformResult.length ? (
    <ChartDisplay query={query} transformResult={transformResult} />
  ) : null;
};

const Chart: React.FC<Props> = ({ queryId, showEditLink }) => {
  return (
    <>
      <InjectFromStore
        id={queryId}
        useFunc={useQuery}
        child={(query) => <Inner query={query} />}
      />

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
