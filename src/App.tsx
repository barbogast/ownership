import Routes from "./Routes";

import { ConfigProvider, theme } from "antd";
import useLocalSettingsStore, { setDarkMode } from "./localSettingsStore";
import "./util/debug";
import { useEffect } from "react";

const { defaultAlgorithm, darkAlgorithm, useToken } = theme;

const MainContainer = () => {
  const { token } = useToken();
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );

  useEffect(() => {
    // We need to set the color scheme on the <body> element.
    // If we would set it as a style prop of this component, any siblings
    // (like the portal for antd's <Modal>) would not inherit the style.
    document.body.style.colorScheme = darkModeEnabled ? "dark" : "light";
    document.body.style.color = token.colorText;
  }, [darkModeEnabled, token.colorText]);

  useEffect(() => {
    const onChange = (event: Event) =>
      setDarkMode((event as MediaQueryListEvent).matches);

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", onChange);

    return () => {
      window.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div
      style={{
        background: token.colorBgContainer,
        height: "100%",
      }}
    >
      <Routes />
    </div>
  );
};

const App = () => {
  const darkModeEnabled = useLocalSettingsStore(
    (state) => state.darkModeEnabled
  );
  return (
    <ConfigProvider
      theme={{
        algorithm: darkModeEnabled ? darkAlgorithm : defaultAlgorithm,
        token: {
          // https://ant.design/docs/react/customize-theme#seedtoken
          borderRadius: 2,
          ...(darkModeEnabled
            ? { colorTextBase: "rgba(211, 211, 211, 0.85" }
            : {}),
        },
      }}
    >
      <MainContainer />
    </ConfigProvider>
  );
};

export default App;
