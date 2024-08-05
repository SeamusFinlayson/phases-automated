import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { Automation } from "./types";

export const AUTOMATION_METADATA_ID = "automations";
export const AUTOMATION_CONTEXT_MENU_METADATA_ID = "contextMenuPhase";
export const NO_CONTEXT_MENU = "none";

export const MAX_AUTOMATIONS = 8;
export const MINIMUM_PHASES = 2;

export function createAutomation(
  name: string,
  currentPhase: number,
  totalPhases: number,
): Automation {
  return {
    id: Date.now().toString() + Math.trunc(1000 * Math.random()),
    name,
    currentPhase,
    totalPhases: totalPhases,
    properties: [],
  };
}

export function isAutomation(
  potentialAutomation: unknown,
): potentialAutomation is Automation {
  const automation = potentialAutomation as Automation;

  if (automation.id === undefined) return false;
  if (typeof automation.id !== "string") return false;

  if (automation.name === undefined) return false;
  if (typeof automation.name !== "string") return false;

  if (automation.currentPhase === undefined) return false;
  if (typeof automation.currentPhase !== "number") return false;

  if (automation.totalPhases === undefined) return false;
  if (typeof automation.totalPhases !== "number") return false;

  if (!Array.isArray(automation.properties)) return false;
  if (
    (automation.properties.filter((value) => typeof value !== "string"),
    length > 0)
  )
    return false;
  return true;
}

/** Get automations from scene */
export async function getAutomationsFromScene(): Promise<Automation[]> {
  const sceneMetadata = await OBR.scene.getMetadata();

  if (typeof sceneMetadata === "undefined") {
    return [];
  }

  return getAutomationsFromSceneMetadata(sceneMetadata);
}

export function getAutomationsFromSceneMetadata(sceneMetadata: Metadata) {
  const automations: Automation[] = [];

  const automationMetadata = sceneMetadata[getPluginId(AUTOMATION_METADATA_ID)];
  if (!automationMetadata) return automations;
  if (!Array.isArray(automationMetadata)) {
    throw TypeError(`Expected an array, got ${typeof automationMetadata}`);
  }

  for (const automation of automationMetadata) {
    if (!isAutomation(automation)) {
      console.log(
        "Invalid automation detected, automation was deleted, see contents below: ",
        automation,
      );
    } else {
      automations.push(automation);
    }
  }

  return automations;
}

export function setAutomationContextMenu(id: string) {
  OBR.scene.setMetadata({
    [getPluginId(AUTOMATION_CONTEXT_MENU_METADATA_ID)]: id,
  });
}

/** Get context menu phase item from scene */
export async function getAutomationContextMenuFromScene(): Promise<string> {
  const sceneMetadata = await OBR.scene.getMetadata();

  if (typeof sceneMetadata === "undefined") {
    return "";
  }

  return getAutomationContextMenuFromSceneMetadata(sceneMetadata);
}

export function getAutomationContextMenuFromSceneMetadata(
  sceneMetadata: Metadata,
) {
  let automationContextMenu = "none";
  const automationContextMenuMetadata =
    sceneMetadata[getPluginId(AUTOMATION_CONTEXT_MENU_METADATA_ID)];
  if (typeof automationContextMenuMetadata === "string") {
    automationContextMenu = automationContextMenuMetadata;
  }

  return automationContextMenu;
}
