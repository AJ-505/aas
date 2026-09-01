import { useEffect, useRef, useState, useCallback } from "react";
import { useConvexMutation } from "@convex-dev/react-query";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { clearLoginSession } from "~/lib/two-factor-session";

const INACTIVITY_MS = 30 * 60 * 1000;
const WARNING_MS = 25 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60_000;
const CHECK_INTERVAL_MS = 30_000;

export function useInactivity(enabled: boolean) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const heartbeatMut = useConvexMutation(api.users.heartbeat);
  const logActivity = useConvexMutation(api.activityLogs.log);
  const lastActiveRef = useRef<number>(Date.now());
  const lastHeartbeatRef = useRef<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const touch = useCallback(() => {
    lastActiveRef.current = Date.now();
    if (showWarning) {
      // don't auto hide warning, let user extend
    }
  }, [showWarning]);

  const doHeartbeat = useCallback(async () => {
    const now = Date.now();
    if (now - lastHeartbeatRef.current < 55_000) return;
    try {
      await (heartbeatMut as any)({});
      lastHeartbeatRef.current = now;
    } catch {
      // ignore
    }
  }, [heartbeatMut]);

  const extend = useCallback(async () => {
    lastActiveRef.current = Date.now();
    setShowWarning(false);
    await doHeartbeat();
  }, [doHeartbeat]);

  useEffect(() => {
    if (!enabled) return;
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    let debounce: number | undefined;
    const handler = () => {
      if (debounce) window.clearTimeout(debounce);
      debounce = window.setTimeout(() => touch(), 300) as unknown as number;
    };
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    // initial heartbeat
    doHeartbeat();
    const hbInterval = window.setInterval(doHeartbeat, HEARTBEAT_INTERVAL_MS);
    const checkInterval = window.setInterval(async () => {
      const now = Date.now();
      const idle = now - lastActiveRef.current;
      if (idle >= INACTIVITY_MS) {
        window.clearInterval(hbInterval);
        window.clearInterval(checkInterval);
        try {
          await (logActivity as any)({
            event: "session_expired",
            userAgent: navigator.userAgent,
            screenInfo: `${window.screen.width}x${window.screen.height}`,
          });
          clearLoginSession();
          await signOut();
        } catch {}
        router.navigate({ to: "/auth/login", search: { expired: "1" } as any });
      } else if (idle >= WARNING_MS) {
        setShowWarning(true);
        setSecondsLeft(Math.max(0, Math.ceil((INACTIVITY_MS - idle) / 1000)));
      } else {
        setSecondsLeft(0);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      window.clearInterval(hbInterval);
      window.clearInterval(checkInterval);
      if (debounce) window.clearTimeout(debounce as any);
    };
  }, [enabled, doHeartbeat, logActivity, signOut, router, touch]);

  // countdown ticker when warning shown
  useEffect(() => {
    if (!showWarning) return;
    const t = window.setInterval(() => {
      const idle = Date.now() - lastActiveRef.current;
      const left = Math.max(0, Math.ceil((INACTIVITY_MS - idle) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        // will be handled by main interval
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [showWarning]);

  return { showWarning, secondsLeft, extend, dismiss: () => setShowWarning(false) };
}
