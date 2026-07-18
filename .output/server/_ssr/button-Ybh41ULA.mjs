import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-Ybh41ULA.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			default: "bg-accent text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)] hover:bg-accent-deep",
			secondary: "bg-line-soft text-body hover:bg-line",
			outline: "border border-line bg-surface text-body hover:bg-bg hover:border-line",
			destructive: "bg-rose-600 text-white hover:bg-rose-700",
			ghost: "text-body hover:bg-bg hover:text-ink",
			link: "text-accent underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-3.5",
			sm: "h-8 rounded-lg px-3 text-xs",
			lg: "h-10 px-5 text-sm",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button, buttonVariants };
