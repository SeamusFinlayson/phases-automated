import { Collapse, Checkbox, FormControlLabel } from "@mui/material";
import { Automation, ItemProperty, ReducerAction } from "../types";

type CheckboxProperty = { displayName: string; property: ItemProperty };

export default function PropertiesDropdown({
  expanded,
  dispatch,
  automation,
}: {
  expanded: boolean;
  dispatch: React.Dispatch<ReducerAction>;
  automation: Automation;
}): JSX.Element {
  const checkboxProperties: CheckboxProperty[] = [
    { displayName: "Position", property: "POSITION" },
    { displayName: "Rotation", property: "ROTATION" },
    { displayName: "Scale", property: "SCALE" },
    { displayName: "Visible", property: "VISIBLE" },
    { displayName: "Locked", property: "LOCKED" },
    { displayName: "Image", property: "IMAGE_URL" },
    // { displayName: "Name", property: "NAME" },
    // { displayName: "Z-Index", property: "Z_INDEX" },
    // { displayName: "Metadata", property: "METADATA" },
  ];

  return (
    <Collapse in={expanded} timeout={"auto"} unmountOnExit>
      <div
        className={`justify-center border-t border-black/10 pl-2 dark:border-white/10`}
      >
        <div className="px-2">
          <h2 className="pb-1 pt-3">Automated Properties</h2>
          <div className="columns-2 pb-2">
            <Properties
              properties={checkboxProperties}
              dispatch={dispatch}
              automation={automation}
            ></Properties>
          </div>
        </div>
      </div>
    </Collapse>
  );
}

function Properties({
  properties,
  dispatch,
  automation,
}: {
  properties: CheckboxProperty[];
  dispatch: React.Dispatch<ReducerAction>;
  automation: Automation;
}): JSX.Element[] {
  return properties.map((checkbox) => (
    <FormControlLabel
      key={checkbox.property}
      control={
        <Checkbox
          checked={
            automation.properties.filter((value) => value === checkbox.property)
              .length > 0
          }
          size="small"
          onChange={(event) =>
            dispatch({
              type: "updateAutomatedProperties",
              automationId: automation.id,
              newProperties: event.target.checked
                ? [...automation.properties, checkbox.property]
                : automation.properties.filter(
                    (value) => value !== checkbox.property,
                  ),
            })
          }
        />
      }
      label={checkbox.displayName}
    ></FormControlLabel>
  ));
}
