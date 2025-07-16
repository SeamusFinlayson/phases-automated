import { isImage, Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { ItemProperty, PhaseData } from "./types";

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
  preventOverwrite: boolean,
) => {
  if (typeof phase !== "number") throw "Error: expected type number";

  const stored = getPhaseData(item, phase);

  item.metadata[getPhaseMetadataId(phase)] = {
    ...(properties.includes("POSITION")
      ? preventOverwrite && stored.position !== undefined
        ? { position: stored.position }
        : { position: item.position }
      : {}),
    ...(properties.includes("SCALE")
      ? preventOverwrite && stored.scale !== undefined
        ? { scale: stored.scale }
        : { scale: item.scale }
      : {}),
    ...(properties.includes("ROTATION")
      ? preventOverwrite && stored.rotation !== undefined
        ? { rotation: stored.rotation }
        : { rotation: item.rotation }
      : {}),
    ...(properties.includes("VISIBLE")
      ? preventOverwrite && stored.visible !== undefined
        ? { visible: stored.visible }
        : { visible: item.visible }
      : {}),
    ...(properties.includes("LOCKED")
      ? preventOverwrite && stored.locked !== undefined
        ? { locked: stored.locked }
        : { locked: item.locked }
      : {}),
    ...(properties.includes("IMAGE_URL")
      ? preventOverwrite && stored.imageUrl !== undefined
        ? { imageUrl: stored.imageUrl }
        : { imageUrl: isImage(item) ? item.image.url : null }
      : {}),
  };
};

export const setItemToPhase = (item: Item, phase: number) => {
  const phaseData = getPhaseData(item, phase);
  if (phaseData.position) item.position = phaseData.position;
  if (phaseData.scale) item.scale = phaseData.scale;
  if (phaseData.rotation !== undefined) item.rotation = phaseData.rotation;
  if (phaseData.visible !== undefined) item.visible = phaseData.visible;
  if (phaseData.locked !== undefined) item.locked = phaseData.locked;
  if (typeof phaseData.imageUrl === "string" && isImage(item))
    item.image.url = phaseData.imageUrl;
  item = { ...item };
};

export const getPhaseData = (item: Item, phase: number): PhaseData => {
  const phaseData: unknown = item.metadata[getPhaseMetadataId(phase)];
  if (typeof phaseData !== "object" || phaseData === null) return {};
  return phaseData;
};
