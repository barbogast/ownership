import { ReactElement, useEffect, useState } from "react";
import Logger from "../util/logger";
import stores from "./stores";
import { useProjectByName } from "../project/projectStore";

const logger = new Logger("main");
type Props = {
  projectName: string;
  children: ReactElement[] | ReactElement;
};
const WithNestedStores: React.FC<Props> = ({ children, projectName }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const project = useProjectByName(projectName);

  useEffect(() => {
    if (project) {
      logger.log("rehydrate stores", project);

      for (const store of stores) {
        store.hydrate(project.id);
      }
      setIsInitialized(true);
    }
  }, [project]);
  return isInitialized ? children : null;
};

export default WithNestedStores;
