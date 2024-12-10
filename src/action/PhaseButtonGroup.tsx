import { Automation } from "../types";
import { cn } from "../utils";
import { Action } from "./actionStateLogic";

export default function PhaseButtonGroup({
  automation,
  dispatch,
}: {
  automation: Automation;
  dispatch: React.Dispatch<Action>;
}): JSX.Element {
  const PhaseButtons = [];

  for (let i = 1; i <= automation.totalPhases; i++) {
    PhaseButtons.push(
      <button
        key={i}
        value={i.toString()}
        className={cn(
          "h-8 w-full rounded-md bg-purple-100/25 hover:bg-purple-100/40 dark:bg-white/5 dark:hover:bg-white/10",
          {
            "bg-primary/20 hover:bg-primary/25 dark:bg-primary-dark/30 dark:hover:bg-primary-dark/35 text-primary dark:text-primary-dark":
              i === automation.currentPhase,
          },
        )}
        onClick={() =>
          dispatch({
            type: "currentPhaseChange",
            automationId: automation.id,
            currentPhase: i,
          })
        }
      >
        {i}
      </button>,
    );
  }

  return (
    <div className="flex border-t border-black/10 p-2 dark:border-white/10">
      {PhaseButtons.length <= 6 ? (
        <div className="flex w-full gap-1">{PhaseButtons}</div>
      ) : (
        <div className="grid w-full grid-cols-6 justify-stretch gap-1">
          {PhaseButtons}
        </div>
      )}
    </div>
  );
}
