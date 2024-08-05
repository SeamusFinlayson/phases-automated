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

export interface Automation {
  id: string;
  name: string;
  currentPhase: number;
  totalPhases: number;
  properties: ItemProperty[];
}
