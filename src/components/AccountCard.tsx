import { useState } from "react";
import { firebaseEnabled, signInWithGoogle, signOutUser, useAuthUser } from "../lib/auth";

export default function AccountCard() {
  const user = useAuthUser();
  const [busy, setBusy] = useState(false);

  // Hidden entirely until Firebase is configured — app stays local-only.
  if (!firebaseEnabled) return null;

  async function handleSignIn() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      // popup closed or blocked — nothing to do
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <div className="flex items-center justify-between border border-rule bg-card px-[18px] py-3">
        <div className="flex flex-col gap-0.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-moss">Synced</div>
          <div className="text-[15px] text-ink">{user.displayName ?? user.email}</div>
        </div>
        <button
          onClick={() => signOutUser()}
          className="border-b border-[#d9bfb5] font-mono text-[11px] text-brick"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border border-rule bg-card px-[18px] py-3">
      <div className="flex flex-col gap-0.5">
        <div className="text-[15px] text-ink">Sync across devices</div>
        <div className="font-mono text-[10px] text-muted">Keep your progress on every device</div>
      </div>
      <button
        onClick={handleSignIn}
        disabled={busy}
        className="border border-brick bg-brick px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-paper disabled:opacity-50"
      >
        {busy ? "…" : "SIGN IN WITH GOOGLE"}
      </button>
    </div>
  );
}
