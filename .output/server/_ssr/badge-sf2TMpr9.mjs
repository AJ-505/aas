import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-sf2TMpr9.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold transition-colors", {
	variants: { variant: {
		default: "bg-accent-soft text-accent-deep",
		secondary: "bg-line-soft text-slate-600",
		outline: "border border-line text-body",
		success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
		warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
		destructive: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
		info: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
		violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, dot, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props,
		children: [dot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 shrink-0 rounded-full bg-current" }), children]
	});
}
//#endregion
export { Badge };
