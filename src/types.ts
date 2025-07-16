import { ImageContent, ImageGrid, Vector2 } from "@owlbear-rodeo/sdk";

export type ItemProperty =
  | "POSITION"
  | "ROTATION"
  | "SCALE"
  | "VISIBLE"
  | "LOCKED"
  // | "NAME"
  // | "Z_INDEX"
  // | "METADATA"
  | "IMAGE_URL"; // Actually automates image content as of 1.3.1

export type AppState = {
  automations: Automation[];
  activeAutomation: string;
};

export interface Automation {
  id: string;
  name: string;
  currentPhase: number; // starts at 1
  totalPhases: number;
  properties: ItemProperty[];
}

export type ReducerAction =
  | {
      type: "overwrite";
      automations: Automation[];
    }
  | {
      type: "addAutomation";
    }
  | {
      type: "deleteAutomation";
      automationId: string;
    }
  | {
      type: "moveUp";
      automationId: string;
      index: number;
    }
  | {
      type: "moveDown";
      automationId: string;
      index: number;
    }
  | {
      type: "nameChange";
      automationId: string;
      name: string;
    }
  | {
      type: "currentPhaseChange";
      automationId: string;
      currentPhase: number;
    }
  | {
      type: "totalPhasesChange";
      automationId: string;
      totalPhases: number;
    }
  | {
      type: "updateAutomatedProperties";
      automationId: string;
      newProperties: ItemProperty[];
    };

export interface PhaseData {
  position?: Vector2;
  scale?: Vector2;
  rotation?: number;
  visible?: boolean;
  locked?: boolean;
  imageUrl?: string | null; // deprecated but existing image phases are preserved, null if the automation includes images but the item is not an image item
  imageData?: {
    content: ImageContent;
    grid: ImageGrid;
  } | null; // null if the automation includes images but the item is not an image item
}

export type ButtonClickAction = "INCREMENT" | "DECREMENT" | "SET";
