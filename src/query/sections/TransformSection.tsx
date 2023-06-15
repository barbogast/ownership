import { Button } from "antd";
import { useQuery, updateTransformCode } from "../queryStore";
import css from "./query.module.css";
import { QueryExecResult } from "../../Db";

type Props = {
  queryId: string;
  queryResults: QueryExecResult[];
  runPostProcess: (queryResults: QueryExecResult[]) => void;
  postProcessResult: never[];
};

const TransformSection: React.FC<Props> = ({
  queryId,
  runPostProcess,
  queryResults,
  postProcessResult,
}) => {
  const { transformCode } = useQuery(queryId);

  return (
    <>
      <br />
      <textarea
        value={transformCode}
        onChange={(event) => updateTransformCode(queryId, event.target.value)}
        className={css.codeinput}
      />
      <br />
      <Button type="primary" onClick={() => runPostProcess(queryResults)}>
        Transform
      </Button>
      <br />
      {queryResults.length ? (
        <div className={css.codedisplay}>
          <pre>
            {/* results contains one object per select statement in the query */}
            {JSON.stringify(postProcessResult, null, 2)}
          </pre>
        </div>
      ) : null}
    </>
  );
};

export default TransformSection;
