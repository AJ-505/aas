import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-CrQHCH19.js
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[90px] w-full rounded-[9px] border border-line bg-surface px-3 py-2 text-[13px] text-ink transition-colors placeholder:text-mute focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Textarea };
