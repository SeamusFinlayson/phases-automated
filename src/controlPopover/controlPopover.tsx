import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import { PluginThemeProvider } from "../PluginThemeProvider.tsx";
import { CssBaseline } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import App from "./App.tsx";

OBR.onReady(() => {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <PluginThemeProvider>
        <CssBaseline />
        <App />
      </PluginThemeProvider>
    </React.StrictMode>,
  );
});
