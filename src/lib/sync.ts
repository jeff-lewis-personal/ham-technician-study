import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db, firebaseEnabled } from "./firebase";
import { progressStore } from "./progress";
import type { ExamResult, ProgressState, QuestionStat } from "./types";

const PUSH_DEBOUNCE_MS = 1500;

function mergeStat(a: QuestionStat | undefined, b: QuestionStat | undefined): QuestionStat {
  if (!a) return b!;
  if (!b) return a;
  const aLast = a.lastAnswered ?? 0;
  const bLast = b.lastAnswered ?? 0;
  const recent = bLast > aLast ? b : a; // box/due follow the more recent answer
  return {
    seen: Math.max(a.seen, b.seen),
    correct: Math.max(a.correct, b.correct),
    incorrect: Math.max(a.incorrect, b.incorrect),
    flagged: Boolean(a.flagged || b.flagged),
    lastAnswered: Math.max(aLast, bLast) || null,
    box: recent.box ?? 0,
    due: recent.due ?? null,
  };
}

/** Union two progress states so nothing is lost across devices. */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const questions: Record<string, QuestionStat> = {};
  const ids = new Set([...Object.keys(a.questions ?? {}), ...Object.keys(b.questions ?? {})]);
  for (const id of ids) questions[id] = mergeStat(a.questions?.[id], b.questions?.[id]);

  const seen = new Set<string>();
  const exams: ExamResult[] = [...(a.exams ?? []), ...(b.exams ?? [])]
    .filter((e) => {
      const key = `${e.date}|${e.score}|${e.total}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((x, y) => y.date - x.date);

  return { questions, exams };
}

let user: User | null = null;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let unsubStore: (() => void) | null = null;

function schedulePush() {
  if (!user || !db) return;
  clearTimeout(pushTimer);
  const uid = user.uid;
  pushTimer = setTimeout(() => {
    const state = progressStore.getState();
    setDoc(doc(db!, "progress", uid), { ...state, updatedAt: Date.now() }).catch(() => {
      // transient network error — the next mutation will retry the push
    });
  }, PUSH_DEBOUNCE_MS);
}

/** Wire auth <-> local store <-> Firestore. No-op until Firebase is configured. */
export function initSync(): void {
  if (!firebaseEnabled || !auth || !db) return;

  onAuthStateChanged(auth, async (u) => {
    user = u;
    unsubStore?.();
    unsubStore = null;

    if (!u) return; // signed out -> local-only

    // Pull the server copy, merge with whatever is local, write the union back.
    try {
      const ref = doc(db!, "progress", u.uid);
      const snap = await getDoc(ref);
      const server = snap.exists()
        ? (snap.data() as ProgressState)
        : { questions: {}, exams: [] };
      const merged = mergeProgress(progressStore.getState(), server);
      progressStore.replaceState(merged);
      await setDoc(ref, { ...merged, updatedAt: Date.now() });
    } catch {
      // offline / permission issue — keep working locally; push will retry on change
    }

    // From now on, push local changes (debounced) while signed in.
    unsubStore = progressStore.subscribe(schedulePush);
  });
}
