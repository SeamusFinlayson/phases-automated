import { isImage, Item, Vector2 } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { ItemProperty } from "./types";

interface PhaseData {
  position: Vector2 | undefined;
  scale: Vector2 | undefined;
  rotation: number | undefined;
  visible: boolean | undefined;
  locked: boolean | undefined;
  imageUrl: string | null | undefined;
}

export type ButtonClickAction = "INCREMENT" | "DECREMENT" | "SET";

export const ITEM_AUTOMATION_METADATA_ID = getPluginId("automationId");
export const PHASE_CHANGE_BUTTON_METADATA_ID = getPluginId("phaseChangeButton");
export const BUTTON_SET_PHASE_METADATA_ID = "setPhase";
export const BUTTON_CLICK_ACTION_METADATA_ID = "buttonCLickACtion";

export const SAFE_MAXIMUM_PHASES = 18;

export const getPhaseMetadataId = (phase: number) =>
  getPluginId(`phase${phase}`);

export const setPhaseData = (
  item: Item,
  phase: number,
  properties: ItemProperty[],
  preventOverwrite: boolean = false,
) => {
  if (typeof phase !== "number") throw "Error: expected type number";
  //Add properties if they do not already exist
  const storedPosition = getPhaseData(item, phase, ["POSITION"])?.position;
  const storedScale = getPhaseData(item, phase, ["SCALE"])?.scale;
  const storedRotation = getPhaseData(item, phase, ["ROTATION"])?.rotation;
  const storedVisible = getPhaseData(item, phase, ["VISIBLE"])?.visible;
  const storedLocked = getPhaseData(item, phase, ["LOCKED"])?.locked;
  const storedImageUrl = getPhaseData(item, phase, ["IMAGE_URL"])?.imageUrl;

  item.metadata[getPhaseMetadataId(phase)] = {
    ...(properties.includes("POSITION")
      ? preventOverwrite && storedPosition !== undefined
        ? { position: storedPosition }
        : { position: item.position }
      : {}),
    ...(properties.includes("SCALE")
      ? preventOverwrite && storedScale !== undefined
        ? { scale: storedScale }
        : { scale: item.scale }
      : {}),
    ...(properties.includes("ROTATION")
      ? preventOverwrite && storedRotation !== undefined
        ? { rotation: storedRotation }
        : { rotation: item.rotation }
      : {}),
    ...(properties.includes("VISIBLE")
      ? preventOverwrite && storedVisible !== undefined
        ? { visible: storedVisible }
        : { visible: item.visible }
      : {}),
    ...(properties.includes("LOCKED")
      ? preventOverwrite && storedLocked !== undefined
        ? { locked: storedLocked }
        : { locked: item.locked }
      : {}),
    ...(properties.includes("IMAGE_URL")
      ? preventOverwrite && storedImageUrl !== undefined
        ? { imageUrl: storedImageUrl }
        : { imageUrl: isImage(item) ? item.image.url : null }
      : {}),
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
    if (phaseData.locked !== undefined) item.locked = phaseData.locked;
    if (typeof phaseData.imageUrl === "string" && isImage(item))
      item.image.url = phaseData.imageUrl;
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

  if (properties.includes("LOCKED") && typeof phaseData?.locked !== "boolean")
    return false;

  if (
    properties.includes("IMAGE_URL") &&
    typeof phaseData?.imageUrl !== "string" &&
    typeof phaseData?.imageUrl !== "object" // TODO: checking if the type is object is not a sufficient check for null, null is a valid value
  )
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
