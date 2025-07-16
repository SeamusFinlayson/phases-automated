import { isImage, Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { ItemProperty, PhaseData } from "./types";
import { isImageContent, isImageGrid } from "./typeGuards";

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

  const newPhaseMetadata: PhaseData = {};

  if (properties.includes("POSITION")) {
    Object.assign(newPhaseMetadata, {
      position:
        preventOverwrite && stored.position !== undefined
          ? stored.position
          : item.position,
    } satisfies PhaseData);
  }
  if (properties.includes("SCALE")) {
    Object.assign(newPhaseMetadata, {
      scale:
        preventOverwrite && stored.scale !== undefined
          ? stored.scale
          : item.scale,
    } satisfies PhaseData);
  }
  if (properties.includes("ROTATION")) {
    Object.assign(newPhaseMetadata, {
      rotation:
        preventOverwrite && stored.rotation !== undefined
          ? stored.rotation
          : item.rotation,
    } satisfies PhaseData);
  }
  if (properties.includes("VISIBLE")) {
    Object.assign(newPhaseMetadata, {
      visible:
        preventOverwrite && stored.visible !== undefined
          ? stored.visible
          : item.visible,
    } satisfies PhaseData);
  }
  if (properties.includes("LOCKED")) {
    Object.assign(newPhaseMetadata, {
      locked:
        preventOverwrite && stored.locked !== undefined
          ? stored.locked
          : item.locked,
    } satisfies PhaseData);
  }
  if (properties.includes("IMAGE_URL")) {
    // Preserve deprecated image url automations
    if (typeof stored.imageUrl === "string") {
      Object.assign(newPhaseMetadata, {
        imageUrl:
          preventOverwrite && stored.imageUrl !== undefined
            ? stored.imageUrl
            : isImage(item)
              ? item.image.url
              : null,
      } satisfies PhaseData);
      // Standard image content automation
    } else {
      Object.assign(newPhaseMetadata, {
        imageData:
          preventOverwrite && stored.imageData !== undefined
            ? stored.imageData
            : isImage(item)
              ? { content: item.image, grid: item.grid }
              : null,
      } satisfies PhaseData);
    }
  }

  item.metadata[getPhaseMetadataId(phase)] = newPhaseMetadata;
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
  if (
    isImageContent(phaseData.imageData?.content) &&
    isImageGrid(phaseData.imageData.grid) &&
    isImage(item)
  ) {
    item.image = phaseData.imageData.content;
    item.grid = phaseData.imageData.grid;
  }
  item = { ...item };
};

export const getPhaseData = (item: Item, phase: number): PhaseData => {
  const phaseData: unknown = item.metadata[getPhaseMetadataId(phase)];
  if (typeof phaseData !== "object" || phaseData === null) return {};
  return phaseData;
};
