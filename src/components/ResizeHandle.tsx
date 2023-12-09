import { theme } from "antd";
import { PanelResizeHandle } from "react-resizable-panels";

const ResizeHandle = () => {
  const { token } = theme.useToken();

  return (
    <PanelResizeHandle
      style={{
        width: 10,
        background: token.colorSplit,
        marginRight: 10,
        marginLeft: 10,
        display: "flex",
      }}
    >
      <svg viewBox="0 0 24 24">
        <path
          fill={token.colorIcon}
          d="M18,16V13H15V22H13V2H15V11H18V8L22,12L18,16M2,12L6,16V13H9V22H11V2H9V11H6V8L2,12Z"
        />
      </svg>
    </PanelResizeHandle>
  );
};

export default ResizeHandle;
