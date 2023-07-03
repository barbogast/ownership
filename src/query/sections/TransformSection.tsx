import { Button } from "antd";
import { useQuery, updateTransformCode } from "../queryStore";
import { QueryExecResult } from "../../dbStore";
import css from "../query.module.css";

type Props = {
  queryId: string;
  queryResults: QueryExecResult[];
  runPostProcess: (queryResults: QueryExecResult[]) => void;
};

const TransformSection: React.FC<Props> = ({
  queryId,
  runPostProcess,
  queryResults,
}) => {
  const { transformCode } = useQuery(queryId);

  return (
    <>
      <textarea
        value={transformCode}
        onChange={(event) => updateTransformCode(queryId, event.target.value)}
        className={css.codeinput}
      />
      <br />
      <Button type="primary" onClick={() => runPostProcess(queryResults)}>
        Transform
      </Button>
    </>
  );
};

export default TransformSection;
