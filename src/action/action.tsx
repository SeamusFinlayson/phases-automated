import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PluginThemeProvider } from "../PluginThemeProvider.tsx";
import { CssBaseline } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import {
  Automation,
  getAutomationsFromScene,
  getAutomationContextMenuFromScene,
} from "../sceneMetadataHelpers.ts";

OBR.onReady(async () => {
  let initialAutomations: Automation[] = [];
  let initialPhaseContextMenu: string = "";
  const initialSceneReady = await OBR.scene.isReady();
  if (initialSceneReady) {
    initialAutomations = await getAutomationsFromScene();
    initialPhaseContextMenu = await getAutomationContextMenuFromScene();
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <PluginThemeProvider>
        <CssBaseline />
        <App
          initialAutomations={initialAutomations}
          initialSceneReady={initialSceneReady}
          initialPhaseContextMenu={initialPhaseContextMenu}
        />
      </PluginThemeProvider>
    </React.StrictMode>
  );
});
