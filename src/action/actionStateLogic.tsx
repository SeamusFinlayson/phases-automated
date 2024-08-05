import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  ITEM_AUTOMATION_METADATA_ID,
  getPhaseMetadataId,
  setPhaseData,
  setItemToPhase,
  isPhaseData,
} from "../itemMetadataHelpers";
import {
  AUTOMATION_METADATA_ID,
  createAutomation,
  MAX_AUTOMATIONS,
} from "../sceneMetadataHelpers";
import { Automation, ItemProperty } from "../types";

export type Action =
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
    }
  | {
      type: "updateAutomatedProperties";
      automationId: string;
      newProperties: ItemProperty[];
    };

/** Other code execution dependant on reducer updates, should only use async functions w/o await to not block state updates */
export function reducerWrapper(
  state: Automation[],
  action: Action,
): Automation[] {
  const reducerResult = reducer(state, action);
  if (action.type !== "overwrite") {
    OBR.scene.setMetadata({
      [getPluginId(AUTOMATION_METADATA_ID)]: reducerResult,
    });
  }
  if (action.type === "currentPhaseChange") {
    const automation =
      state[
        state.findIndex((automation) => automation.id === action.automationId)
      ];
    OBR.scene.items.updateItems(
      (item) => {
        return (
          item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)] ===
          action.automationId
        );
      },
      (items) => {
        items.forEach((item) => {
          const phaseData: unknown =
            item.metadata[getPhaseMetadataId(action.currentPhase)];
          console.log(phaseData);
          if (!isPhaseData(phaseData, automation.properties)) {
            console.log("set data");
            setPhaseData(item, action.currentPhase, automation.properties);
          } else {
            console.log("item to phase");
            setItemToPhase(item, action.currentPhase, automation.properties);
          }
        });
      },
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
      return state.filter(
        (automation) => automation.id !== action.automationId,
      );
    case "moveUp": {
      const index = state.findIndex(
        (automation) => automation.id === action.automationId,
      );
      if (index <= 0 || index !== action.index) return state;
      const temp = state[index];
      state[index] = state[index - 1];
      state[index - 1] = temp;
      return [...state];
    }
    case "moveDown": {
      const index = state.findIndex(
        (automation) => automation.id === action.automationId,
      );
      if (index >= state.length - 1 || index !== action.index) return state;
      const temp = state[index];
      state[index] = state[index + 1];
      state[index + 1] = temp;
      return [...state];
    }
    case "nameChange":
      return state.map((automation) => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, name: action.name };
      });
    case "currentPhaseChange":
      return state.map((automation) => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, currentPhase: action.currentPhase };
      });
    case "totalPhasesChange":
      return state.map((automation) => {
        if (automation.id !== action.automationId) return automation;
        return { ...automation, totalPhases: action.totalPhases };
      });
    case "updateAutomatedProperties":
      const index = state.findIndex(
        (automation) => automation.id === action.automationId,
      );
      state[index].properties = [...new Set(action.newProperties)].sort();
      return state;
    default:
      return state;
  }
}
export { MAX_AUTOMATIONS };
