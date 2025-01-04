import OBR from "@owlbear-rodeo/sdk";
import {
  ITEM_AUTOMATION_METADATA_ID,
  setPhaseData,
  setItemToPhase,
} from "./itemMetadataHelpers";
import { Automation } from "./types";

export function changePhase(automation: Automation, newPhase: number) {
  OBR.scene.items.updateItems(
    (item) => {
      return item.metadata[ITEM_AUTOMATION_METADATA_ID] === automation.id;
    },
    (items) => {
      items.forEach((item) => {
        // Create phase data for new phase properties and remove deleted properties
        setPhaseData(item, newPhase, automation.properties, true);
        // Update item based on new phase and automated property changes
        setItemToPhase(item, newPhase, automation.properties);
      });
    },
  );
}
