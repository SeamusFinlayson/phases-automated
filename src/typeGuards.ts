import { Vector2 } from "@owlbear-rodeo/sdk";
import { ItemProperty, PhaseData } from "./types";

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
