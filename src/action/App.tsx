import {
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { useEffect, useReducer, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  Automation,
  AUTOMATION_METADATA_ID,
  AUTOMATION_CONTEXT_MENU_METADATA_ID,
  getAutomationsFromSceneMetadata,
  NO_CONTEXT_MENU,
  getAutomationContextMenuFromScene,
} from "../sceneMetadataHelpers";
import {
  getPhaseMetadataId,
  ITEM_AUTOMATION_METADATA_ID,
  setItemToPhase,
  setPhaseData,
} from "../itemMetadataHelpers";

const MAX_AUTOMATIONS = 3;

function createAutomation(
  name: string,
  currentPhase: number,
  maxPhase: number
): Automation {
  return {
    id: Date.now().toString() + Math.trunc(1000 * Math.random()),
    name,
    currentPhase,
    maxPhase,
  };
}

type Action =
  | {
      type: "overwrite";
      automations: Automation[];
    }
  | {
      type: "addAutomation";
    }
  | {
      type: "deleteAutomation";
      automationId: string;
    }
  | {
      type: "moveUp";
      automationId: string;
      index: number;
    }
  | {
      type: "moveDown";
      automationId: string;
      index: number;
    }
  | {
      type: "nameChange";
      automationId: string;
      name: string;
    }
  | {
      type: "currentPhaseChange";
      automationId: string;
      currentPhase: number;
    }
  | {
      type: "maxPhaseChange";
      automationId: string;
      maxPhase: number;
    };

/** Other code execution dependant on reducer updates, should only use async functions w/o await to not block state updates */
function reducerWrapper(state: Automation[], action: Action): Automation[] {
  const reducerResult = reducer(state, action);
  if (action.type !== "overwrite") {
    OBR.scene.setMetadata({
      [getPluginId(AUTOMATION_METADATA_ID)]: reducerResult,
    });
  }
  if (action.type === "currentPhaseChange") {
    OBR.scene.items.updateItems(
      item => {
        return (
          item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)] ===
          action.automationId
        );
      },
      items => {
        items.forEach(item => {
          const phaseData: unknown =
            item.metadata[getPhaseMetadataId(action.currentPhase)];
          if (phaseData === undefined) {
            setPhaseData(item, action.currentPhase);
          } else {
            setItemToPhase(item, action.currentPhase);
          }
        });
      }
    );
  }
  return reducerResult;
}

/** Reducer update logic */
function reducer(state: Automation[], action: Action): Automation[] {
  switch (action.type) {
    case "overwrite":
      return action.automations;
    case "addAutomation":
      if (state.length >= MAX_AUTOMATIONS) return state;
      return state.concat(createAutomation("", 1, 2));
    case "deleteAutomation":
      return state.filter(automation => automation.id !== action.automationId);
    case "moveUp": {
      const index = state.findIndex(
        automation => automation.id === action.automationId
      );
      if (index <= 0 || index !== action.index) return state;
      const temp = state[index];
      state[index] = state[index - 1];
      state[index - 1] = temp;
      return [...state];
    }
    case "moveDown": {
      const index = state.findIndex(
        automation => automation.id === action.automationId
      );
      if (index >= state.length - 1 || index !== action.index) return state;
      const temp = state[index];
      state[index] = state[index + 1];
      state[index + 1] = temp;
      return [...state];
    }
    case "nameChange":
      return state.map(automation => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, name: action.name };
      });
    case "currentPhaseChange":
      return state.map(automation => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, currentPhase: action.currentPhase };
      });
    case "maxPhaseChange":
      return state.map(automation => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, maxPhase: action.maxPhase };
      });
    default:
      return state;
  }
}

export default function App({
  initialAutomations,
  initialSceneReady,
  initialPhaseContextMenu,
}: {
  initialAutomations: Automation[];
  initialSceneReady: boolean;
  initialPhaseContextMenu: string;
}) {
  const isDark = useTheme().palette.mode === "dark";

  const [automations, dispatch] = useReducer(
    reducerWrapper,
    initialAutomations
  );
  const [editing, setEditing] = useState(false);
  const [sceneReady, setSceneReady] = useState(initialSceneReady);
  const [activeAutomationContextMenu, setActiveAutomationContextMenu] =
    useState(initialPhaseContextMenu);

  const handleActiveContextMenu = (id: string) => {
    setActiveAutomationContextMenu(id);
    OBR.scene.setMetadata({
      [getPluginId(AUTOMATION_CONTEXT_MENU_METADATA_ID)]: id,
    });
  };

  useEffect(
    () =>
      OBR.scene.onMetadataChange(metadata => {
        dispatch({
          type: "overwrite",
          automations: getAutomationsFromSceneMetadata(metadata),
        });
      }),
    []
  );

  useEffect(
    () =>
      OBR.scene.onReadyChange(ready => {
        setSceneReady(ready);
        if (ready) {
          getAutomationContextMenuFromScene().then(value =>
            setActiveAutomationContextMenu(value)
          );
        }
      }),
    []
  );

  const buttonHeight = 40;
  const automationElements: JSX.Element[] = [];
  const contextMenuOptions: JSX.Element[] = [
    <ToggleButton
      key={NO_CONTEXT_MENU}
      value={NO_CONTEXT_MENU}
      sx={{ height: buttonHeight }}
      onClick={() => handleActiveContextMenu(NO_CONTEXT_MENU)}
    >
      None
    </ToggleButton>,
  ];
  for (let i = 0; i < automations.length; i++) {
    automationElements.push(
      <AutomationElement
        key={automations[i].id}
        automation={automations[i]}
        dispatch={dispatch}
        editing={editing}
        index={i}
      ></AutomationElement>
    );
    contextMenuOptions.push(
      <ToggleButton
        key={automations[i].id}
        value={automations[i].id}
        sx={{ height: buttonHeight }}
        onClick={() => handleActiveContextMenu(automations[i].id)}
      >
        {automations[i].name !== "" ? automations[i].name : i}
      </ToggleButton>
    );
  }

  const sceneDependantElements = (
    <>
      <div className="flex flex-col">
        <div className="bg-black/20 p-2 dark:bg-white/10 rounded-[20px] flex flex-col">
          <p className="text-center">Active Automation Context Menu</p>
          <ToggleButtonGroup
            color="primary"
            orientation="vertical"
            value={activeAutomationContextMenu}
          >
            {contextMenuOptions}
          </ToggleButtonGroup>
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
        >
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
    </>
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex flex-col p-4 gap-3">
        <Typography variant="h5">Phases Automated</Typography>
        {sceneReady && sceneDependantElements}
      </div>
    </div>
  );
}

function AutomationElement({
  automation,
  dispatch,
  editing,
  index,
}: {
  automation: Automation;
  dispatch: React.Dispatch<Action>;
  editing: boolean;
  index: number;
}): JSX.Element {
  const [name, setName] = useState(automation.name);

  useEffect(() => setName(automation.name), [automation.name]);

  const buttonHeight = 40;
  const phaseButtons: JSX.Element[] = [];

  for (let i = 1; i <= automation.maxPhase; i++) {
    phaseButtons.push(
      <ToggleButton
        key={i}
        value={i.toString()}
        onClick={() =>
          dispatch({
            type: "currentPhaseChange",
            automationId: automation.id,
            currentPhase: i,
          })
        }
      >
        {i}
      </ToggleButton>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-black/20 p-2 dark:bg-white/10 rounded-[20px] flex flex-col gap-2">
        <input
          className="bg-black/20 rounded-2xl px-2 h-10 outline-none focus:bg-black/35 duration-75 text-center"
          placeholder="Automation Name"
          value={name}
          onChange={e => {
            setName(e.target.value);
          }}
          onBlur={() => {
            dispatch({
              type: "nameChange",
              automationId: automation.id,
              name: name,
            });
          }}
        ></input>
        {editing ? (
          <div className="flex justify-between">
            <Button
              onClick={() => {
                dispatch({
                  type: "deleteAutomation",
                  automationId: automation.id,
                });
              }}
              sx={{ height: buttonHeight }}
            >
              Delete
            </Button>
            <div>
              <IconButton
                onClick={() =>
                  dispatch({
                    type: "moveDown",
                    automationId: automation.id,
                    index,
                  })
                }
              >
                <ArrowDownwardRoundedIcon color="primary"></ArrowDownwardRoundedIcon>
              </IconButton>
              <IconButton
                onClick={() =>
                  dispatch({
                    type: "moveUp",
                    automationId: automation.id,
                    index,
                  })
                }
              >
                <ArrowUpwardRoundedIcon color="primary"></ArrowUpwardRoundedIcon>
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <ToggleButtonGroup
              color="primary"
              value={automation.currentPhase.toString()}
              exclusive
              sx={{ height: buttonHeight }}
            >
              {phaseButtons}
            </ToggleButtonGroup>
            <div>
              <IconButton
                onClick={() =>
                  dispatch({
                    type: "maxPhaseChange",
                    automationId: automation.id,
                    maxPhase:
                      automation.maxPhase > 2
                        ? automation.maxPhase - 1
                        : automation.maxPhase,
                  })
                }
              >
                <RemoveCircleRoundedIcon color="primary"></RemoveCircleRoundedIcon>
              </IconButton>
              <IconButton
                onClick={() =>
                  dispatch({
                    type: "maxPhaseChange",
                    automationId: automation.id,
                    maxPhase:
                      automation.maxPhase < 6
                        ? automation.maxPhase + 1
                        : automation.maxPhase,
                  })
                }
              >
                <AddCircleRoundedIcon color="primary"></AddCircleRoundedIcon>
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
