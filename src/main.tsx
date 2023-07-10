import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Logger from "./util/logger.ts";

Logger.enable();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
