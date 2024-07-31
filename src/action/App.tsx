import {
  Button,
  IconButton,
  Radio,
  ToggleButton,
  ToggleButtonGroup,
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
  getAutomationsFromSceneMetadata,
  NO_CONTEXT_MENU,
  getAutomationContextMenuFromScene,
  setAutomationContextMenu,
  getAutomationContextMenuFromSceneMetadata,
} from "../sceneMetadataHelpers";
import {
  getPhaseMetadataId,
  ITEM_AUTOMATION_METADATA_ID,
  setItemToPhase,
  setPhaseData,
} from "../itemMetadataHelpers";

const MAX_AUTOMATIONS = 8;
const MINIMUM_PHASES = 2;
const MAXIMUM_PHASES = 8;

function createAutomation(
  name: string,
  currentPhase: number,
  totalPhases: number
): Automation {
  return {
    id: Date.now().toString() + Math.trunc(1000 * Math.random()),
    name,
    currentPhase,
    totalPhases: totalPhases,
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
      type: "totalPhasesChange";
      automationId: string;
      totalPhases: number;
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
    case "totalPhasesChange":
      return state.map(automation => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, totalPhases: action.totalPhases };
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
    setAutomationContextMenu(id);
  };

  useEffect(
    () =>
      OBR.scene.onMetadataChange(metadata => {
        dispatch({
          type: "overwrite",
          automations: getAutomationsFromSceneMetadata(metadata),
        });
        setActiveAutomationContextMenu(
          getAutomationContextMenuFromSceneMetadata(metadata)
        );
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
      ></AutomationElement>
    );
  }

  const sceneDependantElements = (
    <>
      <div className="flex flex-col">
        <div className="p-2 dark:bg-white/0 rounded-[20px] flex flex-col outline outline-1 outline-black/10 dark:outline-white/10 gap-2">
          <div className="flex items-center">
            <Radio
              checked={activeAutomationContextMenu === NO_CONTEXT_MENU}
              onClick={() => handleActiveContextMenu(NO_CONTEXT_MENU)}
            ></Radio>
            <div>
              <p className="text-left pt-0.5 text-black/[0.87] dark:text-white">
                No Context Menu
              </p>
              <p className="text-left text-xs max-w-56 text-black/[0.6] dark:text-white/70">
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
        >
          {editing ? "Done" : "Edit"}
        </Button>
      </div>
    </>
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen flex-col p-3 gap-3 overflow-y-auto">
        <h1 className="font-bold text-lg pl-1 text-black/[0.87] dark:text-white">
          Phases Automated
        </h1>
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
  radioChecked,
  setRadioChecked,
}: {
  automation: Automation;
  dispatch: React.Dispatch<Action>;
  editing: boolean;
  index: number;
  radioChecked: boolean;
  setRadioChecked: (id: string) => void;
}): JSX.Element {
  const [name, setName] = useState(automation.name);

  useEffect(() => setName(automation.name), [automation.name]);

  const buttonHeight = 40;
  const phaseButtons: JSX.Element[] = [];

  for (let i = 1; i <= automation.totalPhases; i++) {
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
      <div
        className={
          "relative bg-rose-200/30 p-2 dark:bg-slate-300/10 rounded-[20px] flex flex-col gap-2 outline outline-1 outline-black/10 dark:outline-none"
        }
      >
        {editing && (
          <div className="z-10 absolute w-full h-h-full dark:bg-purple-600/85 bg-purple-300/85 top-0 left-0 right-0 bottom-0 rounded-[20px]">
            <div className="flex items-center justify-around h-full">
              <div className="w-[40px]"></div>
              <button
                className="text-xl rounded-2xl px-4 py-2 hover:bg-black/[0.045] dark:hover:bg-white/[0.08] duration-150 text-black/[0.87] dark:text-white"
                onClick={() => {
                  dispatch({
                    type: "deleteAutomation",
                    automationId: automation.id,
                  });
                }}
              >
                {"delete"}
              </button>

              <div className="flex flex-col gap-2">
                <IconButton
                  onClick={() =>
                    dispatch({
                      type: "moveUp",
                      automationId: automation.id,
                      index,
                    })
                  }
                >
                  <ArrowUpwardRoundedIcon></ArrowUpwardRoundedIcon>
                </IconButton>
                <IconButton
                  onClick={() =>
                    dispatch({
                      type: "moveDown",
                      automationId: automation.id,
                      index,
                    })
                  }
                >
                  <ArrowDownwardRoundedIcon></ArrowDownwardRoundedIcon>
                </IconButton>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center">
          <Radio
            checked={radioChecked}
            onClick={() => setRadioChecked(automation.id)}
          ></Radio>
          <input
            className={
              "bg-purple-300/15 grow shrink focus:bg-purple-300/35 dark:bg-black/20 text-black/[0.87] dark:text-white rounded-2xl px-2 h-10 outline-none dark:focus:bg-black/35 duration-75 text-center outline w-full outline-1 outline-offset-0 outline-black/10 dark:outline-none"
            }
            placeholder={`Automation ${index + 1}`}
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
        </div>
        <div className="flex justify-between flex-wrap-reverse gap-2">
          <ToggleButtonGroup
            color="primary"
            value={automation.currentPhase.toString()}
            exclusive
            sx={{ height: buttonHeight }}
          >
            {phaseButtons}
          </ToggleButtonGroup>
          <div className="grow flex justify-end">
            <div>
              <IconButton
                onClick={() =>
                  dispatch({
                    type: "totalPhasesChange",
                    automationId: automation.id,
                    totalPhases:
                      automation.totalPhases > MINIMUM_PHASES
                        ? automation.totalPhases - 1
                        : automation.totalPhases,
                  })
                }
              >
                <RemoveCircleRoundedIcon color="primary"></RemoveCircleRoundedIcon>
              </IconButton>
              <IconButton
                onClick={() =>
                  dispatch({
                    type: "totalPhasesChange",
                    automationId: automation.id,
                    totalPhases:
                      automation.totalPhases < MAXIMUM_PHASES
                        ? automation.totalPhases + 1
                        : automation.totalPhases,
                  })
                }
              >
                <AddCircleRoundedIcon color="primary"></AddCircleRoundedIcon>
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
