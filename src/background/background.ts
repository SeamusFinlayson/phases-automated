import OBR, { Item } from "@owlbear-rodeo/sdk";
import {
  Automation,
  getAutomationsFromScene,
  getAutomationsFromSceneMetadata,
  getAutomationContextMenuFromScene,
  getAutomationContextMenuFromSceneMetadata,
  NO_CONTEXT_MENU,
  setAutomationContextMenu,
} from "../sceneMetadataHelpers";
import { getPluginId } from "../getPluginId";
import {
  getPhaseData,
  getPhaseMetadataId,
  ITEM_AUTOMATION_METADATA_ID,
  MAXIMUM_PHASES,
  setPhaseData,
} from "../itemMetadataHelpers";

const menuIcon = new URL(
  "../assets/iconNoFill.svg#icon",
  import.meta.url
).toString();

const ADD_MENU_ID = "addToAutomation";
const REMOVE_MENU_ID = "removeFromAutomation";

let automationContextMenu = NO_CONTEXT_MENU;
let automations: Automation[] = [];

OBR.onReady(async () => {
  init();
  OBR.scene.onMetadataChange(metadata => {
    automationContextMenu = getAutomationContextMenuFromSceneMetadata(metadata);
    automations = getAutomationsFromSceneMetadata(metadata);
    createContextMenu();
  });
  OBR.scene.items.onChange(items => {
    // Filter out phase changes too
    const automatedItems: { item: Item; phase: number }[] = [];
    items.forEach(item => {
      const automationIndex = automations.findIndex(
        automation =>
          automation.id ===
          item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)]
      );
      if (automationIndex !== -1)
        automatedItems.push({
          item,
          phase: automations[automationIndex].currentPhase,
        });
    });
    const changedItems = automatedItems.filter(item => {
      const phaseData = getPhaseData(item.item, item.phase);
      return (
        phaseData !== null &&
        (item.item.position.x !== phaseData.position.x ||
          item.item.position.y !== phaseData.position.y ||
          item.item.scale.x !== phaseData.scale.x ||
          item.item.scale.y !== phaseData.scale.y ||
          item.item.rotation !== phaseData.rotation ||
          item.item.visible !== phaseData.visible)
      );
    });
    OBR.scene.items.updateItems(
      changedItems.map(item => item.item),
      items => {
        items.forEach(item => {
          const index = changedItems.findIndex(
            value => item.id === value.item.id
          );
          setPhaseData(item, changedItems[index].phase);
        });
      }
    );
  });
});

async function init() {
  const handleSceneReady = async () => {
    automationContextMenu = await getAutomationContextMenuFromScene();
    automations = await getAutomationsFromScene();
    createContextMenu();
  };
  // Handle when the scene is either changed or made ready after extension load
  OBR.scene.onReadyChange(async isReady => {
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

function createContextMenu() {
  if (automationContextMenu === NO_CONTEXT_MENU) {
    OBR.contextMenu.remove(getPluginId(ADD_MENU_ID));
    OBR.contextMenu.remove(getPluginId(REMOVE_MENU_ID));
    return;
  }
  const index = getIndexOfContextMenuAutomation();
  if (index === -1) {
    setAutomationContextMenu(NO_CONTEXT_MENU);
    return;
  }
  // const name = automations[index].name;
  // const phase = automations[index].currentPhase;
  const automationId = automations[index].id;
  const currentPhase = automations[index].currentPhase;

  const getAddLabel = () => {
    return `Add to Automation`;
  };
  const getRemoveLabel = () => {
    return `Remove from Automation`;
  };
  OBR.contextMenu.create({
    id: getPluginId(ADD_MENU_ID),
    icons: [
      {
        icon: menuIcon,
        label: getAddLabel(),
        filter: {
          every: [
            {
              key: ["metadata", `${getPluginId(ITEM_AUTOMATION_METADATA_ID)}`],
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
        item => selection?.findIndex(id => id === item.id) !== -1,
        items => {
          items.forEach(item => {
            item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)] =
              automationId;
            setPhaseData(item, currentPhase);
          });
        }
      );
    },
  });
  OBR.contextMenu.create({
    id: getPluginId(REMOVE_MENU_ID),
    icons: [
      {
        icon: menuIcon,
        label: getRemoveLabel(),
        filter: {
          every: [
            {
              key: ["metadata", `${getPluginId(ITEM_AUTOMATION_METADATA_ID)}`],
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
        item => selection?.findIndex(id => id === item.id) !== -1,
        items => {
          items.forEach(item => {
            // Clear all extension metadata
            item.metadata[getPluginId(ITEM_AUTOMATION_METADATA_ID)] = undefined;
            for (let i = 1; i < MAXIMUM_PHASES; i++) {
              item.metadata[getPhaseMetadataId(i)] = undefined;
            }
          });
        }
      );
    },
  });
}

const getIndexOfContextMenuAutomation = () =>
  automations.findIndex(automation => automation.id === automationContextMenu);
