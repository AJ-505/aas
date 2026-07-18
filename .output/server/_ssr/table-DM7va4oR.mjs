import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/table-DM7va4oR.js
var import_jsx_runtime = require_jsx_runtime();
function Table({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full overflow-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			className: cn("w-full caption-bottom text-[13px]", className),
			...props
		})
	});
}
function TableHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
		className: cn("bg-bg [&_tr]:border-b [&_tr]:border-line-soft", className),
		...props
	});
}
function TableBody({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
		className: cn("[&_tr:last-child]:border-0", className),
		...props
	});
}
function TableRow({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
		className: cn("border-b border-line-soft transition-colors hover:bg-bg", className),
		...props
	});
}
function TableHead({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("h-10 px-[18px] text-left align-middle text-[11px] font-bold uppercase tracking-[0.07em] text-mute", className),
		...props
	});
}
function TableCell({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: cn("px-[18px] py-3 align-middle", className),
		...props
	});
}
//#endregion
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
