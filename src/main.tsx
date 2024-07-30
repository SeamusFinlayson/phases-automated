import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PluginThemeProvider } from "./PluginThemeProvider.tsx";
import { CssBaseline } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";

OBR.onReady(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <PluginThemeProvider>
        <CssBaseline />
        <App />
      </PluginThemeProvider>
    </React.StrictMode>
  );
});
