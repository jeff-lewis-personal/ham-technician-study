import { useSyncExternalStore } from "react";
import { progressStore } from "./progress";
import type { ProgressState } from "./types";

/** Subscribe a component to progress changes; re-renders on any mutation. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (cb) => progressStore.subscribe(cb),
    () => progressStore.getState(),
  );
}
