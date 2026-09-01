import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { useFormik } from "formik";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { markLoginStarted } from "~/lib/two-factor-session";
import { useLogActivityMutation } from "~/lib/queries";
import { FieldError, zodToFormikValidate } from "~/lib/formik-helpers";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

type AuthStep = "signIn" | "signUp" | "forgotPassword";

function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const logActivity = useLogActivityMutation();
  const [step, setStep] = useState<AuthStep>("signIn");
  const [resetSent, setResetSent] = useState(false);

  const authSchema = z.object({
    email: z.string().trim().email("Valid email is required"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    name: z.string().trim().optional().or(z.literal("")),
  }).superRefine((v, ctx) => {
    if (step !== "forgotPassword" && (!v.password || v.password.length < 1)) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "Password is required" });
    }
  });

  const formik = useFormik({
    initialValues: { email: "", password: "", name: "" },
    validate: zodToFormikValidate(authSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      const email = values.email.trim();
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", values.password);
      if (values.name) formData.set("name", values.name);
      formData.set("flow", step);
      try {
        if (step === "forgotPassword") {
          // For reset, only email matters - rebuild minimal FormData
          const resetData = new FormData();
          resetData.set("email", email);
          resetData.set("flow", "reset");
          await signIn("password", resetData);
          setResetSent(true);
          toast.success("Check your email for reset link");
          return;
        }
        await signIn("password", formData);
        markLoginStarted();
        logActivity.mutate({
          event: "login",
          email,
          userAgent: navigator.userAgent,
          screenInfo: `${window.screen.width}x${window.screen.height}`,
        });
        toast.success(step === "signIn" ? "Signed in" : "Account created");
        void router.navigate({ to: "/" });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        if (step === "signIn") {
          logActivity.mutate({
            event: "login_failed",
            email,
            userAgent: navigator.userAgent,
            screenInfo: `${window.screen.width}x${window.screen.height}`,
          });
        }
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });
  const submitting = formik.isSubmitting;

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Reuse formik validation for email only
    if (!formik.values.email || !z.string().email().safeParse(formik.values.email).success) {
      formik.setFieldTouched("email", true);
      toast.error("Valid email is required");
      return;
    }
    formik.handleSubmit(e as any);
  }

  if (step === "forgotPassword") {
    return (
      <Card className="w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]">
        <CardContent className="pt-6">
          <div className="mb-5">
            <h1 className="text-lg font-extrabold tracking-tight text-ink">
              Reset your password
            </h1>
            <p className="mt-1 text-[13px] text-mute">
              {resetSent
                ? "If an account exists with that email, you will receive a reset link."
                : "Enter your email and we will send you a reset link."}
            </p>
          </div>
          {resetSent ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent-soft px-4 py-3 text-[13px] text-accent">
                Check your email for the reset link. If it does not appear
                within a few minutes, check your spam folder.
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("signIn");
                  setResetSent(false);
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.email && formik.errors.email)} />
                <FieldError touched={formik.touched.email} error={formik.errors.email} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send reset link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("signIn");
                  setResetSent(false);
                }}
              >
                Back to sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]">
      <CardContent className="pt-6">
        <div className="mb-5">
          <h1 className="text-lg font-extrabold tracking-tight text-ink">
            {step === "signIn" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {step === "signIn"
              ? "Sign in to the workshop dashboard."
              : "Sign up to get started."}
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          {step === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="Your name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.name && formik.errors.name)} />
              <FieldError touched={formik.touched.name} error={formik.errors.name} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.email && formik.errors.email)} />
            <FieldError touched={formik.touched.email} error={formik.errors.email} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {step === "signIn" && (
                <button type="button" onClick={() => setStep("forgotPassword")} className="text-[13px] text-accent hover:text-accent-deep">
                  Forgot password?
                </button>
              )}
            </div>
            <Input id="password" name="password" type="password" placeholder="********" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.password && formik.errors.password)} />
            <FieldError touched={formik.touched.password} error={formik.errors.password} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : step === "signIn" ? "Sign in" : "Sign up"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
          >
            {step === "signIn"
              ? "Create an account instead"
              : "Sign in instead"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
