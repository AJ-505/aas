import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { buttonVariants } from "./button-Ybh41ULA.mjs";
import { IconBanknote, IconCar, IconChevronRight, IconPlus, IconUsers, IconWrench } from "./icons-ON1WsQDq.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { jobQueries, labourTypeQueries, settingsQueries } from "./queries-DshR6pBd.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
import { JOB_STATUS_LABELS } from "./enums-qnepMgfE.mjs";
import { JOB_STATUS_VARIANTS } from "./status-ui-BhxZ5PXL.mjs";
import { formatDateTime, formatNaira } from "./format-Kc-5lS8-.mjs";
import { useCurrentUser } from "./auth-BJb3cJTg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CZoptnNF.js
var import_jsx_runtime = require_jsx_runtime();
function Sparkline({ data, width = 84, height = 30, strokeWidth = 2, className }) {
	const min = Math.min(...data);
	const range = Math.max(...data) - min || 1;
	const pad = strokeWidth;
	const stepX = (width - pad * 2) / Math.max(1, data.length - 1);
	const points = data.map((v, i) => {
		return [pad + i * stepX, pad + (1 - (v - min) / range) * (height - pad * 2)];
	});
	const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
	const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
	const last = points[points.length - 1] ?? [pad, pad];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width,
		height,
		viewBox: `0 0 ${width} ${height}`,
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: area,
				className: "fill-accent/10",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				points: line,
				fill: "none",
				strokeWidth,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				className: "stroke-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: last[0],
				cy: last[1],
				r: strokeWidth + .6,
				className: "fill-accent"
			})
		]
	});
}
function greeting() {
	const h = (/* @__PURE__ */ new Date()).getHours();
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
}
function Dashboard() {
	const { data: user } = useCurrentUser();
	const navigate = useNavigate();
	const { data: summary, isLoading } = useQuery({
		...jobQueries.dashboardSummary(),
		enabled: !!user
	});
	const { data: settings } = useQuery({
		...settingsQueries.get(),
		enabled: !!user
	});
	const { data: labourTypes } = useQuery({
		...labourTypeQueries.list(),
		enabled: !!user
	});
	const recent = summary?.recent ?? [];
	const canSeeFinance = user?.role === "finance" || user?.role === "manager" || user?.role === "admin";
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	const kpis = [
		{
			label: "Open jobs",
			value: String(summary?.open ?? 0),
			icon: IconWrench,
			foot: (summary?.checkedInThisWeek ?? 0) > 0 ? `+${summary?.checkedInThisWeek ?? 0} this week` : "No check-ins this week",
			trend: summary?.checkinTrend ?? []
		},
		{
			label: "In progress",
			value: String(summary?.inProgress ?? 0).padStart(2, "0"),
			icon: IconCar,
			foot: (summary?.techsOnSite ?? 0) > 0 ? `${summary?.techsOnSite ?? 0} technician${summary?.techsOnSite === 1 ? "" : "s"} on the floor` : "No active work"
		},
		{
			label: "Ready for pickup",
			value: String(summary?.ready ?? 0).padStart(2, "0"),
			icon: IconUsers,
			foot: (summary?.ready ?? 0) > 0 ? "Awaiting collection" : "Nothing waiting"
		},
		{
			label: "Customers",
			value: String(summary?.customersTotal ?? 0),
			icon: IconUsers,
			foot: (summary?.newThisMonth ?? 0) > 0 ? `+${summary?.newThisMonth ?? 0} this month` : "Registered total",
			trend: summary?.customerTrend ?? []
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: [greeting(), user?.name ? `, ${user.name.split(" ")[0]}` : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: [
						(/* @__PURE__ */ new Date()).toLocaleDateString("en-NG", {
							weekday: "long",
							day: "numeric",
							month: "long"
						}),
						" · ",
						summary?.open ?? 0,
						" open job",
						(summary?.open ?? 0) === 1 ? "" : "s",
						" in the workshop"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/service/customers",
						className: buttonVariants({ variant: "outline" }),
						children: "Add customer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/service/checkin",
						className: buttonVariants(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPlus, { size: 15 }), " Check In Vehicle"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: kpis.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,18,34,0.07)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(k.icon, { size: 15 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-mute",
								children: k.label
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2.5 flex items-end justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[25px] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]",
								children: k.value
							}), k.trend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, { data: k.trend })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-[11.5px] font-semibold text-emerald-600",
							children: k.foot
						})
					]
				}, k.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_330px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex-row items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "flex items-center gap-2",
							children: ["Active jobs", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600",
								children: summary?.open ?? 0
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/service/jobs",
							className: "flex items-center gap-1 text-[12.5px] font-semibold text-accent hover:text-accent-deep",
							children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 13 })]
						})]
					}), recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-[18px] py-10 text-center text-[13px] text-mute",
						children: "No jobs yet. Check in the first vehicle of the day."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-line-soft bg-bg text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute",
										children: "Vehicle"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute",
										children: "Customer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "hidden h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute lg:table-cell",
										children: "Complaint"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "hidden h-9 px-[18px] text-[11px] font-bold uppercase tracking-[0.07em] text-mute md:table-cell",
										children: "Checked in"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "h-9 w-10" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recent.slice(0, 8).map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "cursor-pointer border-b border-line-soft transition-colors last:border-0 hover:bg-bg",
								onClick: () => navigate({
									to: "/service/job/$id",
									params: { id: job._id }
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-[18px] py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											dot: true,
											variant: JOB_STATUS_VARIANTS[job.status] ?? "secondary",
											children: JOB_STATUS_LABELS[job.status] ?? job.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "whitespace-nowrap px-[18px] py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-ink",
											children: job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : "-"
										}), job.vehicle?.plate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] tracking-wide text-mute",
											children: job.vehicle.plate.toUpperCase()
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-[18px] py-3",
										children: job.customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2 font-medium text-ink",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
												name: job.customer.name,
												size: 24
											}), job.customer.name]
										}) : "-"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "hidden max-w-[220px] truncate px-[18px] py-3 text-mute lg:table-cell",
										children: job.complaint
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "hidden whitespace-nowrap px-[18px] py-3 text-[12.5px] text-mute md:table-cell",
										children: formatDateTime(job.checkInTs)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-2 text-mute",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 15 })
									})
								]
							}, job._id)) })]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex-row items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent check-ins" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/service/jobs",
								className: "text-[12.5px] font-semibold text-accent hover:text-accent-deep",
								children: "All jobs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-2",
							children: recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "py-4 text-center text-[13px] text-mute",
								children: "Nothing checked in yet."
							}) : recent.slice(0, 5).map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/service/job/$id",
								params: { id: job._id },
								className: "flex items-center gap-3 border-b border-line-soft py-2.5 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCar, { size: 15 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block truncate text-[13px] font-medium text-ink",
											children: [job.vehicle ? `${job.vehicle.make} ${job.vehicle.model}` : "Vehicle", job.customer ? ` - ${job.customer.name}` : ""]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[11.5px] text-mute",
											children: formatDateTime(job.checkInTs)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
										size: 14,
										className: "shrink-0 text-mute"
									})
								]
							}, job._id))
						})] }),
						canSeeFinance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex-row items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Finance snapshot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/service/finance",
								className: "text-[12.5px] font-semibold text-accent hover:text-accent-deep",
								children: "Open"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-1 pt-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between py-1 text-[13px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-body",
										children: "VAT rate"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-ink [font-variant-numeric:tabular-nums]",
										children: [settings?.vatRate ?? 7.5, "%"]
									})]
								}),
								(labourTypes ?? []).slice(0, 3).map((lt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between py-1 text-[13px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-body",
										children: lt.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-ink [font-variant-numeric:tabular-nums]",
										children: formatNaira(lt.fixedPrice)
									})]
								}, lt._id)),
								(!labourTypes || labourTypes.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "py-1 text-[12.5px] text-mute",
									children: "No labour types configured yet."
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Quick links" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "flex flex-col gap-1 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/service/customers",
									label: "Customers",
									note: "Directory & vehicles"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/service/jobs",
									label: "Workshop jobs",
									note: "Board & check-in"
								}),
								user?.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/admin/users",
									label: "User management",
									note: "Roles & access"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-mute",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBanknote, { size: 15 }), "Vehicle sales"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: "Phase 4"
									})]
								})
							]
						})] })
					]
				})]
			})
		]
	});
}
function QuickLink({ to, label, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium text-body", "transition-colors hover:bg-bg hover:text-ink"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block font-semibold text-ink",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[11.5px] text-mute",
			children: note
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
			size: 14,
			className: "text-mute"
		})]
	});
}
//#endregion
export { Dashboard as component };
