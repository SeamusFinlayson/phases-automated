export type ItemProperty =
  | "POSITION"
  | "ROTATION"
  | "SCALE"
  | "VISIBLE"
  | "LOCKED"
  | "NAME"
  | "Z_INDEX"
  | "METADATA"
  | "IMAGE_URL";

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
