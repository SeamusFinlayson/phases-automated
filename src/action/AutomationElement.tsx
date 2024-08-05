import {
  ToggleButton,
  IconButton,
  Radio,
  ToggleButtonGroup,
  // Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MAXIMUM_PHASES } from "../itemMetadataHelpers";
import { MINIMUM_PHASES } from "../sceneMetadataHelpers";
import { Automation } from "../types";
import PropertiesDropdown from "./PropertiesDropdown";

import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Action } from "./actionStateLogic";
// import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export default function AutomationElement({
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
  const [expanded, setExpanded] = useState(false);

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
      </ToggleButton>,
    );
  }

  return (
    <div className="relative">
      {editing && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 h-full w-full rounded-[20px] bg-purple-300/85 dark:bg-purple-600/85">
          <div className="flex h-full items-center justify-around">
            <div className="w-[40px]"></div>
            <button
              className="rounded-2xl px-4 py-2 text-xl text-black/[0.87] duration-150 hover:bg-black/[0.045] dark:text-white dark:hover:bg-white/[0.08]"
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
      <div
        className={
          "flex flex-col rounded-[20px] bg-rose-200/30 p-2 outline outline-1 outline-black/10 dark:bg-slate-300/10 dark:outline-none"
        }
      >
        <div className="flex items-center">
          <Radio
            checked={radioChecked}
            onClick={() => setRadioChecked(automation.id)}
          ></Radio>
          <input
            className={
              "h-10 w-full shrink grow rounded-2xl bg-purple-300/15 px-2 text-black/[0.87] outline-none outline outline-1 outline-offset-0 outline-black/10 duration-75 focus:bg-purple-300/35 dark:bg-black/20 dark:text-white dark:outline-none dark:focus:bg-black/35"
            }
            placeholder={`Automation ${index + 1}`}
            value={name}
            onChange={(e) => {
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

        <div className="py-2">
          <ToggleButtonGroup
            color="primary"
            value={automation.currentPhase.toString()}
            exclusive
            sx={{ height: buttonHeight }}
            fullWidth
          >
            {phaseButtons}
          </ToggleButtonGroup>
        </div>
        <div className="flex flex-wrap-reverse justify-between gap-2">
          <div className="flex grow justify-between">
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
                <RemoveCircleRoundedIcon></RemoveCircleRoundedIcon>
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
                <AddCircleRoundedIcon></AddCircleRoundedIcon>
              </IconButton>
            </div>
            {/* <Button startIcon={<SearchRoundedIcon></SearchRoundedIcon>}>21 Items</Button> */}
            <IconButton
              onClick={() =>
                expanded ? setExpanded(false) : setExpanded(true)
              }
            >
              <ExpandMoreRoundedIcon
                className={`${expanded ? "rotate-180" : "rotate-0"}`}
              ></ExpandMoreRoundedIcon>
            </IconButton>
          </div>
        </div>
        <PropertiesDropdown
          expanded={expanded}
          dispatch={dispatch}
          automation={automation}
        ></PropertiesDropdown>
      </div>
    </div>
  );
}
