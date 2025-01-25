import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

const DANGER_MODE_METADATA_ID = getPluginId("dangerMode");

export async function getDangerModeFromRoom(): Promise<boolean> {
  const roomMetadata = await OBR.room.getMetadata();

  if (typeof roomMetadata === "undefined") {
    return false;
  }

  return getDangerModeFromRoomMetadata(roomMetadata);
}

export function getDangerModeFromRoomMetadata(roomMetadata: Metadata): boolean {
  const dangerMode = roomMetadata[DANGER_MODE_METADATA_ID];
  if (typeof dangerMode !== "boolean") return false;
  return dangerMode;
}

export async function setRoomDangerMode(dangerMode: boolean) {
  OBR.room.setMetadata({
    [DANGER_MODE_METADATA_ID]: dangerMode,
  });
}
