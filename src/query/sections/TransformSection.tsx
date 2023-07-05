import { Button } from "antd";
import { useQuery, updateTransformCode } from "../queryStore";
import { QueryExecResult } from "../../dbStore";
import Editor from "@monaco-editor/react";

type Props = {
  queryId: string;
  queryResults: QueryExecResult[];
  runTransform: (queryResults: QueryExecResult[]) => void;
};

const TransformSection: React.FC<Props> = ({
  queryId,
  runTransform,
  queryResults,
}) => {
  const { transformCode } = useQuery(queryId);

  return (
    <>
      <Editor
        height="500px"
        defaultLanguage="typescript"
        defaultValue={transformCode}
        onChange={(value) => value && updateTransformCode(queryId, value)}
      />
      <br />
      <Button type="primary" onClick={() => runTransform(queryResults)}>
        Transform
      </Button>
    </>
  );
};

export default TransformSection;
