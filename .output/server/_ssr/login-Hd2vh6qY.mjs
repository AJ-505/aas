import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react, useAuthActions } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent } from "./card-DIXlT7Xg.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Hd2vh6qY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { signIn } = useAuthActions();
	const router = useRouter();
	const [step, setStep] = (0, import_react.useState)("signIn");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [resetSent, setResetSent] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setSubmitting(true);
		try {
			if (step === "forgotPassword") {
				await signIn("password", formData);
				setResetSent(true);
				zt.success("Check your email for reset link");
				return;
			}
			await signIn("password", formData);
			zt.success(step === "signIn" ? "Signed in" : "Account created");
			router.navigate({ to: "/" });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Authentication failed";
			zt.error(message);
		} finally {
			setSubmitting(false);
		}
	}
	if (step === "forgotPassword") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-extrabold tracking-tight text-ink",
					children: "Reset your password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: resetSent ? "If an account exists with that email, you will receive a reset link." : "Enter your email and we will send you a reset link."
				})]
			}), resetSent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-accent-soft px-4 py-3 text-[13px] text-accent",
					children: "Check your email for the reset link. If it does not appear within a few minutes, check your spam folder."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					className: "w-full",
					onClick: () => {
						setStep("signIn");
						setResetSent(false);
					},
					children: "Back to sign in"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							name: "email",
							type: "email",
							placeholder: "you@example.com",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "flow",
						type: "hidden",
						value: "reset"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: submitting,
						children: submitting ? "Sending..." : "Send reset link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						className: "w-full",
						onClick: () => {
							setStep("signIn");
							setResetSent(false);
						},
						children: "Back to sign in"
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-extrabold tracking-tight text-ink",
					children: step === "signIn" ? "Welcome back" : "Create your account"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: step === "signIn" ? "Sign in to the workshop dashboard." : "Sign up to get started."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					step === "signUp" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							name: "name",
							type: "text",
							placeholder: "Your name"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							name: "email",
							type: "email",
							placeholder: "you@example.com",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Password"
							}), step === "signIn" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setStep("forgotPassword"),
								className: "text-[13px] text-accent hover:text-accent-deep",
								children: "Forgot password?"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							name: "password",
							type: "password",
							placeholder: "********",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "flow",
						type: "hidden",
						value: step
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: submitting,
						children: submitting ? "Please wait..." : step === "signIn" ? "Sign in" : "Sign up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						className: "w-full",
						onClick: () => setStep(step === "signIn" ? "signUp" : "signIn"),
						children: step === "signIn" ? "Create an account instead" : "Sign in instead"
					})
				]
			})]
		})
	});
}
//#endregion
export { LoginPage as component };
