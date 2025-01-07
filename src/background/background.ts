import OBR, { isImage, Item } from "@owlbear-rodeo/sdk";
import {
  getAutomationsFromScene,
  getAutomationsFromSceneMetadata,
  getAutomationContextMenuFromScene,
  getAutomationContextMenuFromSceneMetadata,
  NO_CONTEXT_MENU,
  AUTOMATION_METADATA_ID,
} from "../sceneMetadataHelpers";
import { Automation } from "../types";
import { getPluginId } from "../getPluginId";
import {
  BUTTON_CLICK_ACTION_METADATA_ID,
  BUTTON_SET_PHASE_METADATA_ID,
  ButtonClickAction,
  getPhaseData,
  getPhaseMetadataId,
  ITEM_AUTOMATION_METADATA_ID,
  MAXIMUM_PHASES,
  PHASE_CHANGE_BUTTON_METADATA_ID,
  setPhaseData,
} from "../itemMetadataHelpers";
import { changePhase } from "../changePhase";

const menuIcon = new URL(
  "../assets/iconNoFill.svg#icon",
  import.meta.url,
).toString();

const ADD_MENU_ID = getPluginId("addToAutomation");
const REMOVE_MENU_ID = getPluginId("removeFromAutomation");

let automations: Automation[] = [];
let activeAutomationId: string = NO_CONTEXT_MENU;
let phaseChangeButtons: PhaseChangeButton[] = [];

OBR.onReady(async () => {
  readySceneDependents();
  handleMetadataChanges();
  handleItemsChanges();
  handleSelectionChanges();
});

function handleSelectionChanges() {
  OBR.player.onChange(async (player) => {
    if (player.selection && player.selection.length === 1) {
      const firstItem = player.selection[0];
      if (
        phaseChangeButtons
          .map((phaseButton) => phaseButton.buttonItemId)
          .includes(firstItem)
      ) {
        OBR.player.deselect();

        const items = await OBR.scene.items.getItems(
          (item) => item.id === firstItem,
        );
        if (items.length !== 1)
          throw new Error("Phase change button not found");
        const phaseChangeButtonItem = items[0];
        const automationId =
          phaseChangeButtonItem.metadata[PHASE_CHANGE_BUTTON_METADATA_ID];
        if (typeof automationId !== "string")
          throw new Error("Automation button has no associated ID");
        const automation = getAutomation(automations, automationId);
        if (automation === undefined)
          throw new Error("There is no automation associated with an ID");

        let newPhase = 0;
        const clickAction = phaseChangeButtonItem.metadata[
          BUTTON_CLICK_ACTION_METADATA_ID
        ] as ButtonClickAction | undefined;
        const setPhase = phaseChangeButtonItem.metadata[
          BUTTON_SET_PHASE_METADATA_ID
        ] as number | undefined;
        if (!clickAction || !setPhase || clickAction === "INCREMENT") {
          newPhase =
            automation.currentPhase < automation.totalPhases
              ? automation.currentPhase + 1
              : 1;
        } else if (clickAction === "DECREMENT") {
          newPhase =
            automation.currentPhase > 1
              ? automation.currentPhase - 1
              : automation.totalPhases;
        } else if (clickAction === "SET") {
          newPhase = setPhase;
        }
        automation.currentPhase = newPhase;
        changePhase(automation, newPhase);
        OBR.scene.setMetadata({
          [getPluginId(AUTOMATION_METADATA_ID)]: automations,
        });
      }
    }
  });
}

function handleItemsChanges() {
  OBR.scene.items.onChange(async (items) => {
    // Filter out phase changes too
    const automatedItems: { item: Item; automation: Automation }[] = [];
    items.forEach((item) => {
      const itemAutomation = getAutomation(
        automations,
        item.metadata[ITEM_AUTOMATION_METADATA_ID],
      );
      if (itemAutomation !== undefined)
        automatedItems.push({
          item,
          automation: itemAutomation,
        });
    });
    const changedItems = automatedItems.filter((item) => {
      const phaseData = getPhaseData(
        item.item,
        item.automation.currentPhase,
        item.automation.properties,
      );
      // console.log("item item position", item.item.position);
      // console.log("phase data", phaseData);
      // console.log(item.automation.properties.includes("POSITION"));
      // console.log(item.item.visible, phaseData?.visible);
      return (
        phaseData !== null &&
        ((item.automation.properties.includes("POSITION") &&
          (item.item.position.x !== phaseData.position?.x ||
            item.item.position.y !== phaseData.position?.y)) ||
          (item.automation.properties.includes("SCALE") &&
            (item.item.scale.x !== phaseData.scale?.x ||
              item.item.scale.y !== phaseData.scale?.y)) ||
          (item.automation.properties.includes("ROTATION") &&
            item.item.rotation !== phaseData.rotation) ||
          (item.automation.properties.includes("VISIBLE") &&
            item.item.visible !== phaseData.visible) ||
          (item.automation.properties.includes("LOCKED") &&
            item.item.locked !== phaseData.locked) ||
          (item.automation.properties.includes("IMAGE_URL") &&
            isImage(item.item) &&
            item.item.image.url !== phaseData.imageUrl))
      );
    });
    // console.log("length of changed items", changedItems.length);
    OBR.scene.items.updateItems(
      changedItems.map((item) => item.item),
      (items) => {
        items.forEach((item) => {
          const index = changedItems.findIndex(
            (value) => item.id === value.item.id,
          );
          setPhaseData(
            item,
            changedItems[index].automation.currentPhase,
            changedItems[index].automation.properties,
          );
        });
      },
    );
    phaseChangeButtons = await getPhaseChangeButtons(items);
  });
}

function handleMetadataChanges() {
  OBR.scene.onMetadataChange((metadata) => {
    activeAutomationId = getAutomationContextMenuFromSceneMetadata(metadata);
    automations = getAutomationsFromSceneMetadata(metadata);
    createItemContextMenu();
    createInsertPhaseControlContextMenu();
  });
}

async function readySceneDependents() {
  const handleSceneReady = async () => {
    activeAutomationId = await getAutomationContextMenuFromScene();
    automations = await getAutomationsFromScene();
    phaseChangeButtons = await getPhaseChangeButtons();
    createItemContextMenu();
    createInsertPhaseControlContextMenu();
  };
  // Handle when the scene is either changed or made ready after extension load
  OBR.scene.onReadyChange(async (isReady) => {
    if (isReady) {
      handleSceneReady();
    }
  });

  // Check if the scene is already ready once the extension loads
  const isReady = await OBR.scene.isReady();
  if (isReady) {
    handleSceneReady();
  }
}

function createItemContextMenu() {
  if (activeAutomationId === NO_CONTEXT_MENU) {
    OBR.contextMenu.remove(ADD_MENU_ID);
    OBR.contextMenu.remove(REMOVE_MENU_ID);
    return;
  }
  const activeAutomation = getAutomation(automations, activeAutomationId);
  if (activeAutomation === undefined) return;

  const getAddLabel = () => {
    return `Add to Automation`;
  };
  const getRemoveLabel = () => {
    return `Remove from Automation`;
  };
  OBR.contextMenu.create({
    id: ADD_MENU_ID,
    icons: [
      {
        icon: menuIcon,
        label: getAddLabel(),
        filter: {
          every: [
            {
              key: ["metadata", `${ITEM_AUTOMATION_METADATA_ID}`],
              value: undefined,
              operator: "==",
            },
          ],
          permissions: ["UPDATE"],
          roles: ["GM"],
        },
      },
    ],
    onClick: async () => {
      const selection = await OBR.player.getSelection();
      OBR.scene.items.updateItems(
        (item) => selection?.findIndex((id) => id === item.id) !== -1,
        (items) => {
          items.forEach((item) => {
            item.metadata[ITEM_AUTOMATION_METADATA_ID] = activeAutomation.id;
            setPhaseData(
              item,
              activeAutomation.currentPhase,
              activeAutomation.properties,
            );
          });
        },
      );
    },
  });
  OBR.contextMenu.create({
    id: REMOVE_MENU_ID,
    icons: [
      {
        icon: menuIcon,
        label: getRemoveLabel(),
        filter: {
          every: [
            {
              key: ["metadata", `${ITEM_AUTOMATION_METADATA_ID}`],
              value: undefined,
              operator: "!=",
            },
          ],
          permissions: ["UPDATE"],
          roles: ["GM"],
        },
      },
    ],
    onClick: async () => {
      const selection = await OBR.player.getSelection();
      OBR.scene.items.updateItems(
        (item) => selection?.findIndex((id) => id === item.id) !== -1,
        (items) => {
          items.forEach((item) => {
            // Clear all extension metadata
            item.metadata[ITEM_AUTOMATION_METADATA_ID] = undefined;
            for (let i = 1; i < MAXIMUM_PHASES; i++) {
              item.metadata[getPhaseMetadataId(i)] = undefined;
            }
          });
        },
      );
    },
  });
}

function getAutomation(
  automations: Automation[],
  activeAutomationId: string | unknown,
) {
  const automation = automations.find(
    (automation) => automation.id === activeAutomationId,
  );
  return automation;
}

function createInsertPhaseControlContextMenu() {
  OBR.contextMenu.create({
    id: getPluginId("insert-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Insert Automation Control",
        filter: {
          roles: ["GM"],
          min: 0,
          max: 0,
        },
      },
    ],
    onClick(context, elementId) {
      OBR.player.deselect();
      OBR.popover.open({
        id: getPluginId("popover"),
        url: `/src/controlPopover/controlPopover.html?positionX=${context.selectionBounds.center.x}&positionY=${context.selectionBounds.center.y}`,
        height: 400,
        width: 300,
        anchorElementId: elementId,
      });
    },
  });
}

async function getPhaseChangeButtons(items?: Item[]) {
  if (items === undefined) items = await OBR.scene.items.getItems();
  const phaseChangeButtons = [];
  for (const item of items) {
    if (item.metadata[PHASE_CHANGE_BUTTON_METADATA_ID] !== undefined) {
      const phaseChangeButton: PhaseChangeButton = {
        buttonItemId: item.id,
        automationId: item.metadata[PHASE_CHANGE_BUTTON_METADATA_ID] as string,
      };
      phaseChangeButtons.push(phaseChangeButton);
    }
  }
  return phaseChangeButtons;
}

type PhaseChangeButton = {
  buttonItemId: string;
  automationId: string;
};
