import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import toast from "react-hot-toast";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const Route = createFileRoute("/auth/verify-2fa")({
  component: Verify2FA,
});

function Verify2FA() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const verify = useMutation({ mutationFn: useConvexMutation((api as any).twoFactor.verifyLogin) as any });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim();
    if (!c) return;
    try {
      await (verify.mutateAsync as any)({ code: c });
      toast.success("Verified");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.data ?? err?.message ?? "Invalid code");
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <h1 className="text-lg font-extrabold text-ink">Two-factor verification</h1>
          <p className="mt-1 text-sm text-mute">Enter the 6-digit code from your authenticator app, or a backup code.</p>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456 or backup code" autoFocus maxLength={16} />
            </div>
            <Button type="submit" className="w-full" disabled={verify.isPending}>
              {verify.isPending ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
