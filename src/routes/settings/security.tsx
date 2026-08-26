import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import toast from "react-hot-toast";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const Route = createFileRoute("/settings/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const status = useQuery(convexQuery((api as any).twoFactor.status, {}));
  const setup = useMutation({ mutationFn: useConvexMutation((api as any).twoFactor.setup) as any });
  const verifySetup = useMutation({ mutationFn: useConvexMutation((api as any).twoFactor.verifySetup) as any });
  const disable = useMutation({ mutationFn: useConvexMutation((api as any).twoFactor.disable) as any });
  const regen = useMutation({ mutationFn: useConvexMutation((api as any).twoFactor.regenerateBackupCodes) as any });

  const [pending, setPending] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [regenCodes, setRegenCodes] = useState<string[] | null>(null);

  const totpEnabled = !!(status.data as any)?.totpEnabled;

  async function startSetup() {
    try {
      const res: any = await (setup.mutateAsync as any)({});
      setPending(res);
      setBackupCodes(null);
    } catch (e: any) { toast.error(e?.data ?? e?.message ?? "Failed"); }
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res: any = await (verifySetup.mutateAsync as any)({ code });
      setBackupCodes(res.backupCodes);
      setPending(null);
      setCode("");
      toast.success("Two-factor enabled");
      status.refetch?.();
    } catch (e: any) { toast.error(e?.data ?? e?.message ?? "Invalid code"); }
  }

  async function doDisable() {
    try {
      await (disable.mutateAsync as any)({ code: disableCode || undefined });
      toast.success("Two-factor disabled");
      setDisableCode("");
      status.refetch?.();
    } catch (e: any) { toast.error(e?.data ?? e?.message ?? "Failed"); }
  }

  async function doRegen() {
    try {
      const res: any = await (regen.mutateAsync as any)({ code });
      setRegenCodes(res.backupCodes);
      toast.success("Backup codes regenerated");
    } catch (e: any) { toast.error(e?.data ?? e?.message ?? "Invalid code"); }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-extrabold text-ink">Security</h1>
        <p className="text-sm text-mute">Manage two-factor authentication and backup codes.</p>
        <p className="mt-2 text-xs text-mute">Secrets are stored encrypted at rest by Convex; no extra field encryption (scope cut). Never share codes.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-ink">Authenticator (TOTP)</div>
              <div className="text-sm text-mute">{totpEnabled ? "Enabled" : "Not enabled"}</div>
            </div>
            {totpEnabled ? (
              <div className="flex gap-2">
                <Input placeholder="Code to disable" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} className="w-36" />
                <Button variant="outline" onClick={doDisable} disabled={disable.isPending}>Disable</Button>
              </div>
            ) : (
              <Button onClick={startSetup} disabled={setup.isPending}>Enable</Button>
            )}
          </div>

          {pending && (
            <div className="rounded-xl border border-line p-4 space-y-3">
              <div className="font-medium text-ink">Scan with your authenticator app</div>
              <div className="flex flex-col items-center gap-3">
                <LocalQr uri={pending.uri} />
                <div className="text-xs text-mute break-all max-w-full">Secret: <span className="font-mono text-ink">{pending.secret}</span></div>
                <div className="text-xs text-mute break-all">URI: <span className="font-mono">{pending.uri}</span></div>
              </div>
              <form onSubmit={confirmSetup} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Enter 6-digit code to verify</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
                </div>
                <Button type="submit" disabled={verifySetup.isPending}>Verify</Button>
              </form>
              {backupCodes && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="font-semibold text-amber-800">Backup codes — save and print</div>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-sm">
                    {backupCodes.map((c) => <span key={c} className="border rounded px-2 py-1 bg-white">{c}</span>)}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => window.print()}>Print</Button>
                </div>
              )}
            </div>
          )}

          {totpEnabled && !pending && (
            <div className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Code to regenerate backup codes</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" />
                </div>
                <Button variant="outline" onClick={doRegen} disabled={regen.isPending}>Regenerate</Button>
              </div>
              {regenCodes && (
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {regenCodes.map((c) => <span key={c} className="border rounded px-2 py-1 bg-white">{c}</span>)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LocalQr({ uri }: { uri: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) void QRCode.toCanvas(ref.current, uri, { width: 180, margin: 1 });
  }, [uri]);
  return <canvas ref={ref} className="border border-line rounded-lg" />;
}
