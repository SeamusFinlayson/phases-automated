import { ImageContent, ImageGrid, Vector2 } from "@owlbear-rodeo/sdk";
import { ItemProperty, PhaseData } from "./types";

// TODO: rewrite type guards with has valid key function for elegance
export function phaseDataHasAllProperties(
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

  if (properties.includes("IMAGE_URL")) {
    if (
      phaseData.imageData === undefined &&
      typeof phaseData?.imageUrl !== "string" &&
      phaseData?.imageUrl !== null
    )
      return false;
    else if (typeof phaseData.imageData !== "object") return false;
  }

  return true;
}

export function isVector2(vector2: unknown): vector2 is Vector2 {
  const test = vector2 as Vector2;

  if (typeof vector2 === "undefined") return false;
  if (typeof test.x !== "number") return false;
  if (typeof test.y !== "number") return false;

  return true;
}

const hasValidKey = (object: object, key: string, type: string) => {
  return typeof (object as Record<string, unknown>)?.[key] === type;
};

export function isImageContent(
  imageContent: unknown,
): imageContent is ImageContent {
  if (typeof imageContent !== "object") return false;
  if (imageContent === null) return false;
  if (!hasValidKey(imageContent, "width", "number")) return false;
  if (!hasValidKey(imageContent, "height", "number")) return false;
  if (!hasValidKey(imageContent, "mime", "string")) return false;
  if (!hasValidKey(imageContent, "url", "string")) return false;

  return true;
}

export function isImageGrid(imageGrid: unknown): imageGrid is ImageGrid {
  if (typeof imageGrid !== "object") return false;
  if (imageGrid === null) return false;
  if (!isVector2((imageGrid as Record<string, unknown>)?.offset)) return false;
  if (!hasValidKey(imageGrid, "dpi", "number")) return false;

  return true;
}
