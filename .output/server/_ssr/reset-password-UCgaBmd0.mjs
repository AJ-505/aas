import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react, useAuthActions } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { Link, useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent } from "./card-DIXlT7Xg.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-UCgaBmd0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const { signIn } = useAuthActions();
	const router = useRouter();
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [completed, setCompleted] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setSubmitting(true);
		try {
			await signIn("password", formData);
			zt.success("Password reset successfully");
			setCompleted(true);
			setTimeout(() => void router.navigate({ to: "/auth/login" }), 2e3);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Reset failed";
			zt.error(message);
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "w-full shadow-[0_18px_50px_rgba(15,18,34,0.10)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-extrabold tracking-tight text-ink",
					children: "Set new password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: completed ? "Your password has been reset. Redirecting to sign in..." : "Enter the code from your email and choose a new password."
				})]
			}), completed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg bg-accent-soft px-4 py-3 text-[13px] text-accent",
					children: "Your password was reset successfully. You will be redirected to sign in."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth/login",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						className: "w-full",
						children: "Back to sign in"
					})
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "code",
							children: "Reset code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "code",
							name: "code",
							type: "text",
							placeholder: "Enter the code from the email",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "newPassword",
							children: "New password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "newPassword",
							name: "newPassword",
							type: "password",
							placeholder: "At least 8 characters",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "flow",
						type: "hidden",
						value: "reset-verification"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: submitting,
						children: submitting ? "Resetting..." : "Reset password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth/login",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							className: "w-full",
							children: "Back to sign in"
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
