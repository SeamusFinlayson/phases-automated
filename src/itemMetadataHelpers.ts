import { Item, Vector2 } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

export const ITEM_AUTOMATION_METADATA_ID = "automationId";
export const MAXIMUM_PHASES = 8;

export const getPhaseMetadataId = (phase: number) =>
  getPluginId(`phase${phase}`);

export const setPhaseData = (item: Item, phase: number) => {
  if (typeof phase !== "number") throw "Error: expected type number";
  item.metadata[getPhaseMetadataId(phase)] = {
    position: item.position,
    scale: item.scale,
    rotation: item.rotation,
    visible: item.visible,
  };
};

export const setItemToPhase = (item: Item, phase: number) => {
  const phaseData = getPhaseData(item, phase);
  if (phaseData) {
    item.position = phaseData.position;
    item.scale = phaseData.scale;
    item.rotation = phaseData.rotation;
    item.visible = phaseData.visible;
  } else console.log("bad phase data");
};

export const getPhaseData = (item: Item, phase: number): PhaseData | null => {
  const phaseData: unknown = item.metadata[getPhaseMetadataId(phase)];
  if (!isPhaseData(phaseData)) return null;
  else return phaseData;
};

export function isPhaseData(
  potentialPhase: unknown
): potentialPhase is PhaseData {
  const phaseData = potentialPhase as PhaseData;

  if (!isVector2(phaseData.position)) return false;

  if (!isVector2(phaseData.scale)) return false;

  if (typeof phaseData.rotation !== "number") return false;

  if (typeof phaseData.visible !== "boolean") return false;

  return true;
}

export function isVector2(vector2: unknown): vector2 is Vector2 {
  const test = vector2 as Vector2;

  if (typeof vector2 === "undefined") return false;
  if (typeof test.x !== "number") return false;
  if (typeof test.y !== "number") return false;

  return true;
}

export interface PhaseData {
  position: Vector2;
  scale: Vector2;
  rotation: number;
  visible: boolean;
}
