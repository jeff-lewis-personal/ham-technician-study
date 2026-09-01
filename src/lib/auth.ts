import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useSyncExternalStore } from "react";
import { auth, googleProvider, firebaseEnabled } from "./firebase";

let currentUser: User | null = null;
let ready = !firebaseEnabled; // when disabled, we're immediately "settled" as logged-out
const listeners = new Set<() => void>();

if (firebaseEnabled && auth) {
  onAuthStateChanged(auth, (u) => {
    currentUser = u;
    ready = true;
    listeners.forEach((l) => l());
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Current signed-in user, or null. Re-renders on auth changes. */
export function useAuthUser(): User | null {
  return useSyncExternalStore(subscribe, () => currentUser);
}

/** Whether the initial auth state has settled (avoids a sign-in flash). */
export function useAuthReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready);
}

export async function signInWithGoogle(): Promise<void> {
  if (!auth) return;
  await signInWithPopup(auth, googleProvider);
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export { firebaseEnabled };
