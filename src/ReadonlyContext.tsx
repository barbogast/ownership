import { ReactElement, createContext, useContext } from "react";

const ReadOnlyContext = createContext<boolean>(true);

type Props = {
  children: ReactElement[] | ReactElement;
  readOnly: boolean;
};

export const ReadOnly: React.FC<Props> = ({ children, readOnly }) => {
  return (
    <ReadOnlyContext.Provider value={readOnly}>
      {children}
    </ReadOnlyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useReadOnly = () => useContext(ReadOnlyContext);
