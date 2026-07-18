import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/label-Dfjt7mD7.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-[9px] border border-line bg-surface px-3 text-[13px] text-ink transition-colors placeholder:text-mute focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-[13px] font-semibold text-body leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className),
		...props
	});
}
//#endregion
export { Input, Label };
