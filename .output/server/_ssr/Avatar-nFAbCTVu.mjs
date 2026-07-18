import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Avatar-nFAbCTVu.js
var import_jsx_runtime = require_jsx_runtime();
var PALETTE = [
	"#6366f1",
	"#0ea5e9",
	"#f59e0b",
	"#10b981",
	"#f43f5e",
	"#8b5cf6",
	"#14b8a6",
	"#f97316"
];
function avatarColor(name) {
	let hash = 0;
	for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(i) | 0;
	return PALETTE[Math.abs(hash) % PALETTE.length];
}
function initials(name) {
	return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function Avatar({ name, size = 28, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-grid shrink-0 select-none place-items-center rounded-full font-bold text-white", className),
		style: {
			width: size,
			height: size,
			background: avatarColor(name),
			fontSize: size * .38
		},
		"aria-hidden": "true",
		children: initials(name)
	});
}
//#endregion
export { Avatar };
