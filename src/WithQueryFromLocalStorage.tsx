import React from "react";
import { Query, useQuery } from "./query/queryStore";

type Props = {
  queryId: string;
  child: (query: Query) => JSX.Element;
};

const WithQueryFromLocalStorage: React.FC<Props> = ({ child, queryId }) => {
  const query = useQuery(queryId);
  if (!query) {
    return `Query with ID ${queryId} not found.`;
  }

  return child(query);
};

export default WithQueryFromLocalStorage;
