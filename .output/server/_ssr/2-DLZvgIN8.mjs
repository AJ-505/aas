import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { buttonVariants } from "./button-Ybh41ULA.mjs";
import { IconCalendar, IconCar, IconCheck, IconTrendingUp, IconUsers, IconWrench, IconZap } from "./icons-ON1WsQDq.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/2-DLZvgIN8.js
var import_jsx_runtime = require_jsx_runtime();
var features = [
	{
		icon: IconZap,
		title: "Real-time job tracking",
		desc: "Know the status of every vehicle in your shop at a glance."
	},
	{
		icon: IconUsers,
		title: "Customer profiles",
		desc: "Service history, vehicle details, and contact logs in one place."
	},
	{
		icon: IconCalendar,
		title: "Appointment scheduling",
		desc: "Let customers book service slots online. No more phone tag."
	},
	{
		icon: IconTrendingUp,
		title: "Sales & inventory",
		desc: "Manage your showroom stock and track leads through to sale."
	}
];
function LandingTwo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-7xl items-center justify-between px-8 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[17px] font-extrabold tracking-tight text-ink",
					children: "Cedric Masters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth/login",
						className: buttonVariants({
							variant: "ghost",
							size: "sm"
						}),
						children: "Sign in"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth/login",
						className: buttonVariants({ size: "sm" }),
						children: "Get started"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid min-h-[calc(100vh-300px)] max-w-7xl grid-cols-1 items-center gap-12 px-8 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-1.5 text-[12px] font-semibold text-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconZap, { size: 13 }), "End-to-end auto business platform"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-6 text-[44px] font-extrabold leading-[1.08] tracking-tight text-ink",
						children: [
							"One system for",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"service",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "and sales"
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-[15px] leading-relaxed text-body",
						children: "Cedric Masters Autos unifies your workshop operations and vehicle dealership into a single platform. Manage repairs, parts, customers, and showroom inventory without switching between tools."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth/login",
							className: buttonVariants({ size: "lg" }),
							children: "Start free trial"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth/login",
							className: buttonVariants({
								variant: "outline",
								size: "lg"
							}),
							children: "Book a demo"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center gap-6 text-[13px] text-mute",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, {
									size: 14,
									className: "text-emerald-500"
								}), "No credit card"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, {
									size: 14,
									className: "text-emerald-500"
								}), "14-day free trial"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, {
									size: 14,
									className: "text-emerald-500"
								}), "Cancel anytime"]
							})
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-4 rounded-[32px] bg-accent/5 blur-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative grid grid-cols-2 gap-4",
						children: [
							{
								icon: IconWrench,
								value: "200+",
								label: "Workshops onboarded"
							},
							{
								icon: IconCar,
								value: "15K+",
								label: "Vehicles serviced"
							},
							{
								icon: IconUsers,
								value: "98%",
								label: "Customer retention"
							},
							{
								icon: IconTrendingUp,
								value: "NGN 2B+",
								label: "Transactions processed"
							}
						].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(15,18,34,0.04)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(stat.icon, {
									size: 20,
									className: "text-accent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 text-[26px] font-extrabold tracking-tight text-ink",
									children: stat.value
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-[13px] text-mute",
									children: stat.label
								})
							]
						}, stat.label))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-line-soft bg-bg py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-8 md:grid-cols-2 lg:grid-cols-4",
						children: features.map((f) => {
							const Icon = f.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-9 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 17 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-4 text-[15px] font-bold text-ink",
										children: f.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-[13px] leading-relaxed text-body",
										children: f.desc
									})
								]
							}, f.title);
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line-soft bg-surface py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[13px] font-semibold text-mute",
						children: "© 2026 Cedric Masters Autos. All rights reserved."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-5 text-[12px] text-mute",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Privacy" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Terms" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Support" })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { LandingTwo as component };
