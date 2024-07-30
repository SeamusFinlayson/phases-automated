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
import { useReducer, useState } from "react";

interface Automation {
  id: string;
  name: string;
  currentPhase: number;
  maxPhase: number;
}

function createAutomation(
  name: string,
  currentPhase: number,
  maxPhase: number
): Automation {
  return {
    id: Date.now().toString() + Math.random(),
    name,
    currentPhase,
    maxPhase,
  };
}

type Action =
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

function reducer(state: Automation[], action: Action): Automation[] {
  switch (action.type) {
    case "addAutomation":
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

export default function App() {
  const isDark = useTheme().palette.mode === "dark";

  const [automations, dispatch] = useReducer(reducer, []);
  const [editing, setEditing] = useState(false);

  const automationElements: JSX.Element[] = [];
  for (let i = 0; i < automations.length; i++) {
    automationElements.push(
      <Automation
        key={automations[i].id}
        automation={automations[i]}
        dispatch={dispatch}
        editing={editing}
        index={i}
      ></Automation>
    );
  }
  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex flex-col p-4 gap-4">
        <Typography variant="h5">Phases Automated</Typography>
        {automationElements}
        <div className="flex w-full justify-between">
          <Button onClick={() => dispatch({ type: "addAutomation" })}>
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
      </div>
    </div>
  );
}

function Automation({
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
    <div className="flex flex-col gap-4">
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
