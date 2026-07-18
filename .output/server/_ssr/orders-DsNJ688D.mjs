import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { IconChevronRight } from "./icons-ON1WsQDq.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { salesOrderQueries } from "./queries-DshR6pBd.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-DsNJ688D.js
var import_jsx_runtime = require_jsx_runtime();
var ORDER_STATUS_VARIANTS = {
	pending: "warning",
	completed: "success",
	cancelled: "destructive"
};
function SalesOrdersPage() {
	const navigate = useNavigate();
	const { data: orders, isLoading } = useQuery(salesOrderQueries.list());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-[23px] font-extrabold tracking-tight text-ink",
			children: "Sales Orders"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[13px] text-mute",
			children: orders ? `${orders.length} orders` : "Track vehicle sales."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "ID" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Agreed Price" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deposit" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Balance" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reserved" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
			}) }) : !orders || orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 7,
				className: "py-10 text-center text-mute",
				children: "No sales orders yet."
			}) }) : orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "cursor-pointer",
				onClick: () => navigate({
					to: "/sales/order/$id",
					params: { id: o._id }
				}),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "whitespace-nowrap font-semibold text-ink",
						children: ["#", o._id.slice(-6)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-body",
						children: ["NGN ", (o.agreedPrice / 100).toLocaleString()]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-body",
						children: ["NGN ", (o.deposit / 100).toLocaleString()]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-body",
						children: ["NGN ", (o.balance / 100).toLocaleString()]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-[13px] text-mute",
						children: new Date(o.reservedTs).toLocaleDateString("en-NG")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						dot: true,
						variant: ORDER_STATUS_VARIANTS[o.status] ?? "secondary",
						children: o.status.charAt(0).toUpperCase() + o.status.slice(1)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "px-2 text-mute",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 15 })
					})
				]
			}, o._id)) })] })
		})]
	});
}
//#endregion
export { SalesOrdersPage as component };
