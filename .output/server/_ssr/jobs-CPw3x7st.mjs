import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { buttonVariants } from "./button-Ybh41ULA.mjs";
import { IconChevronRight, IconPlus } from "./icons-ON1WsQDq.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { jobQueries } from "./queries-DshR6pBd.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
import { JOB_STATUSES, JOB_STATUS_LABELS } from "./enums-qnepMgfE.mjs";
import { JOB_STATUS_VARIANTS } from "./status-ui-BhxZ5PXL.mjs";
import { formatDateTime } from "./format-Kc-5lS8-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jobs-CPw3x7st.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JobsBoardPage() {
	const [statusFilter, setStatusFilter] = (0, import_react.useState)();
	const { data, isLoading } = useQuery(jobQueries.all());
	const navigate = useNavigate();
	const jobs = data ?? [];
	const visible = statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;
	const countFor = (s) => jobs.filter((j) => j.status === s).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: "Workshop jobs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: "Track every vehicle through the workshop."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/service/checkin",
					className: buttonVariants(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPlus, { size: 15 }), " Check In Vehicle"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
					active: statusFilter === void 0,
					label: "All",
					count: jobs.length,
					onClick: () => setStatusFilter(void 0)
				}), JOB_STATUSES.map((s) => {
					const count = countFor(s);
					if (count === 0) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						active: statusFilter === s,
						label: JOB_STATUS_LABELS[s],
						count,
						onClick: () => setStatusFilter(s)
					}, s);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vehicle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "hidden lg:table-cell",
						children: "Complaint"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "hidden md:table-cell",
						children: "Checked in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
				}) }) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					colSpan: 6,
					className: "py-10 text-center text-mute",
					children: [
						"No jobs found",
						statusFilter ? ` with status “${JOB_STATUS_LABELS[statusFilter]}”` : "",
						"."
					]
				}) }) : visible.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer",
					onClick: () => navigate({
						to: "/service/job/$id",
						params: { id: job._id }
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								dot: true,
								variant: JOB_STATUS_VARIANTS[job.status] ?? "secondary",
								children: JOB_STATUS_LABELS[job.status] ?? job.status
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-ink",
								children: job.vehicle ? `${job.vehicle.make} ${job.vehicle.model} (${job.vehicle.year})` : "-"
							}), job.vehicle?.plate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] tracking-wide text-mute",
								children: job.vehicle.plate.toUpperCase()
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap",
							children: job.customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
									name: job.customer.name,
									size: 24
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-medium text-ink",
									children: job.customer.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] text-mute",
									children: job.customer.phone
								})] })]
							}) : "-"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "hidden max-w-[240px] truncate text-mute lg:table-cell",
							children: job.complaint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "hidden whitespace-nowrap text-[12.5px] text-mute md:table-cell",
							children: formatDateTime(job.checkInTs)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "px-2 text-mute",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 15 })
						})
					]
				}, job._id)) })] })
			})
		]
	});
}
function FilterChip({ active, label, count, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors", active ? "border-accent/50 bg-accent-soft text-accent-deep" : "border-line bg-surface text-mute hover:border-ink/15 hover:text-body"),
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-[11px]", active ? "text-accent-deep" : "text-mute"),
			children: count
		})]
	});
}
//#endregion
export { JobsBoardPage as component };
