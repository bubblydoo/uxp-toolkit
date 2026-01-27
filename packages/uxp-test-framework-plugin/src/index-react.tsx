import "@bubblydoo/uxp-polyfills";

import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./main";

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
