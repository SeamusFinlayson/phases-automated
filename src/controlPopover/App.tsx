import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Automation, ButtonClickAction } from "../types";
import {
  getAutomationsFromScene,
  getAutomationsFromSceneMetadata,
} from "../sceneMetadataHelpers";
import OBR, {
  buildLabel,
  buildShape,
  Math2,
  Vector2,
} from "@owlbear-rodeo/sdk";
import {
  BUTTON_CLICK_ACTION_METADATA_ID,
  BUTTON_SET_PHASE_METADATA_ID,
  PHASE_CHANGE_BUTTON_METADATA_ID,
} from "../itemMetadataHelpers";
import { getPluginId } from "../getPluginId";

type MenuState = {
  automationId: string;
  clickAction: ButtonClickAction | "";
  setPhase: number; // integer starting at one and less than automation.totalPhases
  buttonLabel: string;
  minScale: number;
  maxScale: number;
};

type ValidatableField =
  | "automationId"
  | "clickAction"
  | "setPhase"
  | "buttonLabel"
  | "minScale"
  | "maxScale";

const buttonClickAction: ButtonClickAction[] = [
  "INCREMENT",
  "DECREMENT",
  "SET",
];

export default function App() {
  const [automations, setAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    getAutomationsFromScene().then((value) => setAutomations(value));
    return OBR.scene.onMetadataChange((metadata) =>
      getAutomationsFromSceneMetadata(metadata),
    );
  }, []);

  const [menuState, setMenuState] = useState<MenuState>({
    automationId: "",
    clickAction: "",
    setPhase: 1,
    buttonLabel: "",
    minScale: 1,
    maxScale: 2,
  });

  const [errors, setErrors] = useState<ValidatableField[]>([]);

  return (
    <div
      className="flex h-full flex-col justify-between bg-slate-950/10 p-4"
      // sx={{ background: "background.default" }}
    >
      <div className="space-y-4">
        <h1>Configure Automation Control</h1>
        <FormControl
          size="small"
          fullWidth
          error={errors.includes("automationId")}
        >
          <InputLabel>Automation</InputLabel>
          <Select
            label="Automation"
            value={menuState.automationId}
            onChange={(e) =>
              setMenuState(() => ({
                ...menuState,
                automationId: e.target.value,
              }))
            }
          >
            {automations.map((automation) => (
              <MenuItem key={automation.id} value={automation.id} dense>
                {automation.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="flex gap-2">
          <FormControl
            size="small"
            fullWidth
            error={errors.includes("clickAction")}
          >
            <InputLabel>Click Action</InputLabel>
            <Select
              label="ClickAction"
              value={menuState.clickAction}
              onChange={(e) =>
                setMenuState(() => ({
                  ...menuState,
                  clickAction: e.target.value as ButtonClickAction,
                }))
              }
            >
              {buttonClickAction.map((clickAction) => {
                const value = `${clickAction[0] + clickAction.substring(1).toLowerCase()} Phase`;

                return (
                  <MenuItem key={clickAction} value={clickAction} dense>
                    {value}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {menuState.clickAction === "SET" && (
            <Input
              label="Phase"
              initialValue={menuState.setPhase.toString()}
              onBlur={(e) => {
                const selectedAutomation = automations.find(
                  (automation) => automation.id === menuState.automationId,
                );
                const setPhase = parseNumber(e, {
                  truncate: true,
                  minVal: 1,
                  maxVal: selectedAutomation?.totalPhases,
                });
                setMenuState(() => ({
                  ...menuState,
                  setPhase,
                }));
                return setPhase.toString();
              }}
            />
          )}
        </div>
        <TextField
          fullWidth
          label="Button Label"
          size="small"
          defaultValue={menuState.buttonLabel}
          error={errors.includes("buttonLabel")}
          onBlur={(e) =>
            setMenuState(() => ({
              ...menuState,
              buttonLabel: e.target.value,
            }))
          }
        />
        <div>
          <h2 className="pb-3 text-sm">Zoom Scale</h2>
          <div className="flex items-center gap-2">
            <Input
              label="Minimum"
              initialValue={menuState.minScale.toString()}
              onBlur={(value) => {
                const minScale = parseNumber(value, {
                  minVal: 0.1,
                  maxVal: menuState.maxScale,
                });
                setMenuState(() => ({
                  ...menuState,
                  minScale,
                }));
                return minScale.toString();
              }}
            />
            -
            <Input
              label="Maximum"
              initialValue={menuState.maxScale.toString()}
              onBlur={(value) => {
                const maxScale = parseNumber(value, {
                  minVal: menuState.minScale,
                });
                setMenuState(() => ({
                  ...menuState,
                  maxScale,
                }));
                return maxScale.toString();
              }}
            />
          </div>
        </div>
      </div>
      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          if (getValidationErrors(menuState, automations).length === 0) {
            createInSceneControl(menuState, getUrlPosition());
            OBR.popover.close(getPluginId("popover"));
          } else setErrors(getValidationErrors(menuState, automations));
        }}
      >
        Create
      </Button>
    </div>
  );
}

function parseNumber(
  string: string,
  { ...settings }: { truncate?: boolean; minVal?: number; maxVal?: number },
) {
  let value = parseFloat(string);
  if (Number.isNaN(value)) value = 0;
  if (settings.minVal && value < settings.minVal) value = settings.minVal;
  if (settings.maxVal && value > settings.maxVal) value = settings.maxVal;
  if (settings.truncate) value = Math.trunc(value);
  return value;
}

function Input({
  label,
  initialValue,
  onBlur,
}: {
  label: string;
  initialValue: string;
  onBlur: (value: string) => string;
}) {
  const [content, setContent] = useState(initialValue);
  return (
    <TextField
      size="small"
      label={label}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onBlur={(e) => setContent(onBlur(e.target.value))}
    />
  );
}

function getUrlPosition(): Vector2 {
  let params = new URLSearchParams(document.location.search);
  let positionX = params.get("positionX");
  let positionY = params.get("positionY");
  if (positionX === null || positionY === null)
    throw new Error("Could not get url position");
  return { x: parseNumber(positionX, {}), y: parseNumber(positionY, {}) };
}

function createInSceneControl(menuState: MenuState, position: Vector2) {
  const handleId = menuState.automationId + "-handle" + Date.now();
  const handle = buildShape()
    .id(handleId)
    .shapeType("CIRCLE")
    .position(position)
    .width(50)
    .height(50)
    .strokeOpacity(0)
    .fillOpacity(1)
    .visible(false)
    .zIndex(20000)
    .build();

  const label = buildLabel()
    .id(menuState.automationId + "-button" + Date.now())
    .position(Math2.add(position, { x: 0, y: -40 }))
    .metadata({
      [PHASE_CHANGE_BUTTON_METADATA_ID]: menuState.automationId,
      [BUTTON_CLICK_ACTION_METADATA_ID]: menuState.clickAction,
      [BUTTON_SET_PHASE_METADATA_ID]: menuState.setPhase,
    })
    .plainText(menuState.buttonLabel)
    .attachedTo(handleId)
    .locked(true)
    .minViewScale(menuState.minScale)
    .maxViewScale(menuState.maxScale)
    .pointerHeight(0)
    .build();

  OBR.scene.items.addItems([handle, label]);
}

function getValidationErrors(menuState: MenuState, automations: Automation[]) {
  const errors: ValidatableField[] = [];

  if (
    automations.map((val) => val.id).includes(menuState.automationId) ===
      undefined ||
    menuState.automationId === ""
  )
    errors.push("automationId");
  if (menuState.buttonLabel === "") errors.push("buttonLabel");
  if (menuState.clickAction === "") errors.push("clickAction");

  return errors;
}
