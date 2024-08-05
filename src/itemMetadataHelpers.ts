import { Item, Vector2 } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { ItemProperty } from "./types";

interface PhaseData {
  position: Vector2 | undefined;
  scale: Vector2 | undefined;
  rotation: number | undefined;
  visible: boolean | undefined;
}

export const ITEM_AUTOMATION_METADATA_ID = "automationId";
export const MAXIMUM_PHASES = 8;

export const getPhaseMetadataId = (phase: number) =>
  getPluginId(`phase${phase}`);

export const setPhaseData = (
  item: Item,
  phase: number,
  properties: ItemProperty[],
) => {
  if (typeof phase !== "number") throw "Error: expected type number";
  item.metadata[getPhaseMetadataId(phase)] = {
    position: properties.includes("POSITION") ? item.position : undefined,
    scale: properties.includes("SCALE") ? item.scale : undefined,
    rotation: properties.includes("ROTATION") ? item.rotation : undefined,
    visible: properties.includes("VISIBLE") ? item.visible : undefined,
  };
};

export const setItemToPhase = (
  item: Item,
  phase: number,
  properties: ItemProperty[],
) => {
  const phaseData = getPhaseData(item, phase, properties);
  if (phaseData) {
    if (phaseData.position) item.position = phaseData.position;
    if (phaseData.scale) item.scale = phaseData.scale;
    if (phaseData.rotation !== undefined) item.rotation = phaseData.rotation;
    if (phaseData.visible !== undefined) item.visible = phaseData.visible;
    item = { ...item };
  } else console.log("bad phase data");
};

export const getPhaseData = (
  item: Item,
  phase: number,
  properties: ItemProperty[],
): PhaseData | null => {
  const phaseData: unknown = item.metadata[getPhaseMetadataId(phase)];
  if (!isPhaseData(phaseData, properties)) {
    throw "error";
    return null;
  } else return phaseData;
};

export function isPhaseData(
  potentialPhase: unknown,
  properties: ItemProperty[],
): potentialPhase is PhaseData {
  const phaseData = potentialPhase as PhaseData;

  if (properties.includes("POSITION") && !isVector2(phaseData?.position))
    return false;

  if (properties.includes("SCALE") && !isVector2(phaseData?.scale))
    return false;

  if (
    properties.includes("ROTATION") &&
    typeof phaseData?.rotation !== "number"
  )
    return false;

  if (properties.includes("VISIBLE") && typeof phaseData?.visible !== "boolean")
    return false;

  return true;
}

export function isVector2(vector2: unknown): vector2 is Vector2 {
  const test = vector2 as Vector2;

  if (typeof vector2 === "undefined") return false;
  if (typeof test.x !== "number") return false;
  if (typeof test.y !== "number") return false;

  return true;
}
