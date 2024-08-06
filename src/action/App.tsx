import { Button, Radio, useTheme } from "@mui/material";

import { useEffect, useReducer, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import {
  getAutomationsFromSceneMetadata,
  NO_CONTEXT_MENU,
  setAutomationContextMenu,
  getAutomationContextMenuFromSceneMetadata,
} from "../sceneMetadataHelpers";
import AutomationElement from "./AutomationElement";
import { MAX_AUTOMATIONS, reducerWrapper } from "./actionStateLogic";

export default function App({}: {}) {
  const isDark = useTheme().palette.mode === "dark";

  const [automations, dispatch] = useReducer(reducerWrapper, []);
  const [editing, setEditing] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [activeAutomationContextMenu, setActiveAutomationContextMenu] =
    useState(NO_CONTEXT_MENU);

  const handleActiveContextMenu = (id: string) => {
    setActiveAutomationContextMenu(id);
    setAutomationContextMenu(id);
  };

  useEffect(
    () =>
      OBR.scene.onMetadataChange((metadata) => {
        dispatch({
          type: "overwrite",
          automations: getAutomationsFromSceneMetadata(metadata),
        });
        setActiveAutomationContextMenu(
          getAutomationContextMenuFromSceneMetadata(metadata),
        );
      }),
    [],
  );

  useEffect(() => {
    const handleSceneReadyChange = async (ready: boolean) => {
      setSceneReady(ready);
      if (ready) {
        const sceneMetadata = await OBR.scene.getMetadata();
        setAutomationContextMenu(
          getAutomationContextMenuFromSceneMetadata(sceneMetadata),
        );
        dispatch({
          type: "overwrite",
          automations: getAutomationsFromSceneMetadata(sceneMetadata),
        });
      }
    };
    OBR.scene.isReady().then(handleSceneReadyChange);
    return OBR.scene.onReadyChange(handleSceneReadyChange);
  }, []);

  const automationElements: JSX.Element[] = [];
  for (let i = 0; i < automations.length; i++) {
    automationElements.push(
      <AutomationElement
        key={automations[i].id}
        automation={automations[i]}
        dispatch={dispatch}
        editing={editing}
        index={i}
        radioChecked={activeAutomationContextMenu === automations[i].id}
        setRadioChecked={() => handleActiveContextMenu(automations[i].id)}
      ></AutomationElement>,
    );
  }

  const sceneDependantElements = (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-2 rounded-xl p-2 outline outline-1 outline-black/10 dark:bg-white/0 dark:outline-white/10">
          <div className="flex items-center">
            <Radio
              checked={activeAutomationContextMenu === NO_CONTEXT_MENU}
              onClick={() => handleActiveContextMenu(NO_CONTEXT_MENU)}
            ></Radio>
            <div>
              <p className="pt-0.5 text-left text-black/[0.87] dark:text-white">
                No Context Menu
              </p>
              <p className="max-w-56 text-left text-xs text-black/[0.6] dark:text-white/70">
                To add items to an automation, select that automation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {automationElements}
      <div className="flex w-full justify-between">
        <Button
          disabled={automations.length >= MAX_AUTOMATIONS}
          onClick={() => dispatch({ type: "addAutomation" })}
        >
          New
        </Button>
        <Button
          variant={editing ? "outlined" : "text"}
          onClick={() => {
            setEditing(!editing);
          }}
          sx={{ width: 70 }}
        >
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
    </>
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen flex-col gap-3 overflow-y-auto p-3">
        <h1 className="pl-1 text-lg font-bold text-black/[0.87] dark:text-white">
          Phases Automated
        </h1>
        {sceneReady && sceneDependantElements}
      </div>
    </div>
  );
}
