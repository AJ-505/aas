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
import { useCurrentUser } from "~/lib/auth";

export const Route = createFileRoute("/auth/change-password")({
  component: ChangePassword,
});

function ChangePassword() {
  const { data: user } = useCurrentUser();
  const mustChange = !!(user as any)?.mustChangePassword;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const mut = useMutation({ mutationFn: useConvexMutation(api.users.changePassword) as any });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { toast.error("Passwords do not match"); return; }
    if (next.length < 8) { toast.error("New password must be at least 8 chars"); return; }
    try {
      await (mut.mutateAsync as any)({ currentPassword: mustChange ? undefined : current, newPassword: next });
      toast.success("Password updated");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err?.data ?? err?.message ?? "Failed");
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <h1 className="text-lg font-extrabold text-ink">{mustChange ? "Set a new password" : "Change password"}</h1>
          {mustChange && <p className="mt-1 text-sm text-amber-700">An administrator reset your password. You must set a new one before continuing.</p>}
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            {!mustChange && (
              <div className="space-y-2">
                <Label>Current password</Label>
                <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Confirm new password</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button className="w-full" type="submit" disabled={mut.isPending}>{mut.isPending ? "Saving..." : "Update password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
