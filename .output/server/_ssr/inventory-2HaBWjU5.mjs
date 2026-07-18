import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { vehicleQueries } from "./queries-DshR6pBd.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { VEHICLE_STATUS_LABELS } from "./enums-qnepMgfE.mjs";
import { VEHICLE_STATUS_VARIANTS } from "./status-ui-BhxZ5PXL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-2HaBWjU5.js
var import_jsx_runtime = require_jsx_runtime();
function SalesInventoryPage() {
	useNavigate();
	const { data: vehicles, isLoading } = useQuery(vehicleQueries.inventory());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-[23px] font-extrabold tracking-tight text-ink",
			children: "Vehicle Inventory"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[13px] text-mute",
			children: vehicles ? `${vehicles.length} vehicles` : "Track stock for sale."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vehicle" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Year" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Colour" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Plate" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Cost"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Selling Price"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
			}) }) : !vehicles || vehicles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				className: "py-10 text-center text-mute",
				children: "No vehicles in inventory."
			}) }) : vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "whitespace-nowrap font-semibold text-ink",
					children: [
						v.make,
						" ",
						v.model
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-body",
					children: v.year
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-body",
					children: v.color
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-mute",
					children: v.plate ?? "-"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right text-body",
					children: v.cost != null ? `NGN ${(v.cost / 100).toLocaleString()}` : "-"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right text-body",
					children: v.sellingPrice != null ? `NGN ${(v.sellingPrice / 100).toLocaleString()}` : "-"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					dot: true,
					variant: VEHICLE_STATUS_VARIANTS[v.status] ?? "secondary",
					children: VEHICLE_STATUS_LABELS[v.status]
				}) })
			] }, v._id)) })] })
		})]
	});
}
//#endregion
export { SalesInventoryPage as component };
