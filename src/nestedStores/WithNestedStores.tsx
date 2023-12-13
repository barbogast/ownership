import { ReactElement, useEffect, useState } from "react";
import Logger from "../util/logger";
import stores from "./stores";
import { useRepositoryByName } from "../repository/repositoryStore";

const logger = new Logger("main");
type Props = {
  repositoryName: string;
  children: ReactElement[] | ReactElement;
};
const WithNestedStores: React.FC<Props> = ({ children, repositoryName }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const respoitory = useRepositoryByName(repositoryName);

  useEffect(() => {
    if (respoitory) {
      logger.log("rehydrate stores", respoitory);

      for (const store of stores) {
        store.hydrate(respoitory.id);
      }
      setIsInitialized(true);
    }
  }, [respoitory]);
  return isInitialized ? children : null;
};

export default WithNestedStores;
