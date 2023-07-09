import { ReactElement, useEffect } from "react";
import { enable } from "./query/queryStore";
import useReportStore from "./report/reportStore";
import { useRepoInfo } from "./utils";

type Props = {
  children: ReactElement[] | ReactElement;
};
const RepositoryStores: React.FC<Props> = ({ children }) => {
  const info = useRepoInfo();
  useEffect(() => {
    if (info) {
      console.log("hydrate", info);

      enable(info);

      useReportStore.persist.setOptions({ name: `${info.path}/reports` });
      useReportStore.persist.rehydrate();
    }
  }, [info]);
  return children;
};

export default RepositoryStores;
