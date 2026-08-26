import { Button } from "~/components/ui/button";

export function InactivityWarningModal({ secondsLeft, onExtend, onLogout }: { secondsLeft: number; onExtend: () => void; onLogout: () => void }) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-xl">
        <h2 className="text-base font-extrabold text-ink">Session expiring soon</h2>
        <p className="mt-2 text-sm text-body">
          You&apos;ve been inactive for a while. Your session will expire in{" "}
          <span className="font-mono font-bold text-amber-700">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>{" "}
          due to inactivity. Extend to keep working.
        </p>
        <div className="mt-5 flex gap-3">
          <Button className="flex-1" onClick={onExtend}>
            Extend session
          </Button>
          <Button variant="outline" className="flex-1" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
