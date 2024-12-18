import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  ITEM_AUTOMATION_METADATA_ID,
  setPhaseData,
  setItemToPhase,
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
  state = reducer(state, action);
  if (action.type !== "overwrite") {
    OBR.scene.setMetadata({
      [getPluginId(AUTOMATION_METADATA_ID)]: state,
    });
  }
  if (
    action.type === "currentPhaseChange" ||
    action.type === "updateAutomatedProperties"
  ) {
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
          // Create phase data for new phase properties and remove deleted properties
          setPhaseData(
            item,
            automation.currentPhase,
            automation.properties,
            true,
          );
          // Update item based on new phase and automated property changes
          setItemToPhase(item, automation.currentPhase, automation.properties);
        });
      },
    );
  }
  return state;
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
