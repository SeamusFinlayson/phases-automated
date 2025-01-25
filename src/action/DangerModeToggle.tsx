import { Button } from "@mui/material";
import { setRoomDangerMode } from "../roomMetadataHelpers";

export default function DangerModeToggle({
  dangerMode,
  showHideButton,
  onHide,
}: {
  dangerMode: boolean;
  showHideButton: boolean;
  onHide: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 rounded-xl p-2 outline outline-1 outline-black/10 dark:bg-white/0 dark:outline-white/10">
        <div className="flex items-center">
          <div>
            <div className="flex min-h-[32px] items-center justify-between">
              <p className="pt-0.5 text-left text-black/[0.87] dark:text-white">
                Safe Mode
              </p>
              {showHideButton && (
                <Button size="small" onClick={onHide}>
                  Hide
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-left text-xs text-black/[0.6] dark:text-white/70">
              {
                "Safe mode disables optional features of this extension to keep your scenes running smoothly."
              }
            </p>
            <p className="mt-2 text-left text-xs text-black/[0.6] dark:text-white/70">
              {
                "In safe mode the number of phases an automation can have is limited to twelve. If an automation has too many automated properties and too many phases, copy and pasting it may cause your scene to crash. This crash can be fixed by reloading the page and causes no data loss."
              }
            </p>
          </div>
        </div>
        <Button
          color={dangerMode ? undefined : "warning"}
          onClick={() => setRoomDangerMode(!dangerMode)}
        >
          {dangerMode ? "Enter Safe Mode" : "Leave Safe Mode"}
        </Button>
      </div>
    </div>
  );
}
