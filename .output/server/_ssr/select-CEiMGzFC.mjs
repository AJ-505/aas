import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { IconChevronDown } from "./icons-ON1WsQDq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-CEiMGzFC.js
var import_jsx_runtime = require_jsx_runtime();
function Select({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "h-9 w-full appearance-none rounded-[9px] border border-line bg-surface pl-3 pr-8 text-[13px] font-medium text-ink transition-colors focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50",
			...props,
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronDown, {
			size: 14,
			className: "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mute"
		})]
	});
}
//#endregion
export { Select };
