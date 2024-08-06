import {
  ToggleButton,
  IconButton,
  Radio,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  ITEM_AUTOMATION_METADATA_ID,
  MAXIMUM_PHASES,
} from "../itemMetadataHelpers";
import { MINIMUM_PHASES } from "../sceneMetadataHelpers";
import { Automation } from "../types";
import PropertiesDropdown from "./PropertiesDropdown";

import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Action } from "./actionStateLogic";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";

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
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const updateItemCount = (items: Item[]) => {
      setItemCount(
        items.filter(
          (item) =>
            automation.id ===
            item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)],
        ).length,
      );
    };
    OBR.scene.items.getItems().then(updateItemCount);
    return OBR.scene.items.onChange(updateItemCount);
  }, []);

  useEffect(() => setName(automation.name), [automation.name]);

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
          "flex flex-col rounded-xl bg-purple-100/30 outline outline-1 outline-black/10 dark:bg-slate-100/5 dark:outline-white/10"
        }
      >
        <div className="flex items-center rounded-t-xl bg-purple-100/30 pl-2 dark:bg-slate-950/30">
          <Radio
            checked={radioChecked}
            onClick={() => setRadioChecked(automation.id)}
          ></Radio>
          <input
            className={
              "h-10 w-full shrink grow rounded-2xl bg-transparent px-2 text-black/[0.87] placeholder-black/25 outline-none duration-75 dark:text-white dark:placeholder-white/30 dark:outline-none"
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

        <div className="p-2 pb-1">
          <div className="pt-0">
            <ToggleButtonGroup
              color="primary"
              value={automation.currentPhase.toString()}
              size="small"
              exclusive
              fullWidth
            >
              {phaseButtons}
            </ToggleButtonGroup>
          </div>
          <div className="flex grow justify-between pt-1">
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
            <Button
              onClick={async () => {
                const automationItems = await OBR.scene.items.getItems(
                  (item) =>
                    automation.id ===
                    item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)],
                );
                OBR.player.select(
                  automationItems.map((item) => item.id),
                  true,
                );
              }}
              startIcon={<SearchRoundedIcon></SearchRoundedIcon>}
            >
              {`${itemCount} Items`}
            </Button>
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
          <PropertiesDropdown
            expanded={expanded}
            dispatch={dispatch}
            automation={automation}
          ></PropertiesDropdown>
        </div>
      </div>
    </div>
  );
}
