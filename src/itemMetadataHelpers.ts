import { isImage, Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { ItemProperty, PhaseData } from "./types";
import { isPhaseData } from "./typeGuards";

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
