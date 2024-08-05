import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PluginThemeProvider } from "../PluginThemeProvider.tsx";
import { CssBaseline } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import {
  getAutomationsFromScene,
  getAutomationContextMenuFromScene,
} from "../sceneMetadataHelpers.ts";
import { Automation } from "../types.ts";

OBR.onReady(async () => {
  let role = await OBR.player.getRole();
  let isDark = (await OBR.theme.getTheme()).mode === "DARK";
  setHeight();

  let initialAutomations: Automation[] = [];
  let initialPhaseContextMenu: string = "";
  const initialSceneReady = await OBR.scene.isReady();
  if (initialSceneReady) {
    initialAutomations = await getAutomationsFromScene();
    initialPhaseContextMenu = await getAutomationContextMenuFromScene();
  }

  const root = ReactDOM.createRoot(document.getElementById("root")!);
  render();

  OBR.player.onChange((player) => {
    role = player.role;
    setHeight();
    render();
  });

  OBR.theme.onChange((theme) => {
    isDark = theme.mode === "DARK";
    if (role !== "GM") render();
  });

  function setHeight() {
    OBR.action.setHeight(role === "GM" ? 500 : 100);
  }

  function render() {
    root.render(
      <React.StrictMode>
        <PluginThemeProvider>
          <CssBaseline />
          {role === "GM" ? (
            <App
              initialAutomations={initialAutomations}
              initialSceneReady={initialSceneReady}
              initialPhaseContextMenu={initialPhaseContextMenu}
            />
          ) : (
            <div className={isDark ? "dark" : ""}>
              <div className="flex h-screen flex-col gap-3 overflow-y-auto p-3">
                <h1 className="pl-1 text-lg font-bold text-black/[0.87] dark:text-white">
                  Phases Automated
                </h1>
                <p className="pl-1 text-sm">GM Access Required</p>
              </div>
            </div>
          )}
        </PluginThemeProvider>
      </React.StrictMode>,
    );
  }
});
