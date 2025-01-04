import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  AUTOMATION_METADATA_ID,
  createAutomation,
  MAX_AUTOMATIONS,
} from "../sceneMetadataHelpers";
import { Automation, ReducerAction } from "../types";
import { changePhase } from "../changePhase";

/** Other code execution dependant on reducer updates, should only use await to not block state updates */
export function reducerWrapper(
  state: Automation[],
  action: ReducerAction,
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
    const automation = state.find(
      (automation) => automation.id === action.automationId,
    );
    if (automation === undefined) throw new Error("Could not find automation");
    changePhase(automation, automation.currentPhase);
  }
  return state;
}

/** Reducer update logic */
function reducer(state: Automation[], action: ReducerAction): Automation[] {
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
