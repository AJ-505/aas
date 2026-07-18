import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { buttonVariants } from "./button-Ybh41ULA.mjs";
import { IconBox, IconTrendingUp, IconUsers, IconWrench, IconZap } from "./icons-ON1WsQDq.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/5-Cc0-4e1n.js
var import_jsx_runtime = require_jsx_runtime();
var stats = [
	{
		value: "400+",
		label: "Workshops"
	},
	{
		value: "15,000+",
		label: "Vehicles serviced"
	},
	{
		value: "NGN 2B+",
		label: "Transactions processed"
	},
	{
		value: "98%",
		label: "Customer retention"
	}
];
var features = [
	{
		icon: IconWrench,
		stat: "12 hrs",
		statLabel: "saved per week",
		title: "Streamlined operations",
		desc: "Automate check-ins, job assignments, and customer notifications to cut admin time."
	},
	{
		icon: IconTrendingUp,
		stat: "22%",
		statLabel: "revenue increase",
		title: "Data-driven decisions",
		desc: "See real-time reports on workshop performance, technician productivity, and revenue trends."
	},
	{
		icon: IconUsers,
		stat: "3x",
		statLabel: "faster follow-ups",
		title: "Customer retention",
		desc: "Automated service reminders and history tracking keep customers coming back."
	},
	{
		icon: IconBox,
		stat: "99.9%",
		statLabel: "uptime",
		title: "Reliable infrastructure",
		desc: "Cloud-based platform with Nigerian data hosting. Access your dashboard from anywhere."
	}
];
function LandingFive() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-5",
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
						children: "Start free trial"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-6xl px-6 pt-20 pb-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-4 py-1.5 text-[12px] font-semibold text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconZap, { size: 13 }), "Trusted by 400+ workshops across Nigeria"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-6 text-[40px] font-extrabold leading-[1.1] tracking-tight text-ink",
							children: [
								"The operating system",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"for auto workshops."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-[15px] leading-relaxed text-body",
							children: "Cedric Masters Autos helps workshops and dealerships manage jobs, inventory, customers, and sales in one place. Less paperwork, more productivity."
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
								children: "Talk to sales"
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-4",
						children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-surface p-6 text-center shadow-[0_8px_24px_rgba(15,18,34,0.04)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[30px] font-extrabold tracking-tight text-ink",
								children: s.value
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[13px] text-mute",
								children: s.label
							})]
						}, s.label))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-line-soft bg-surface py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-center text-[26px] font-extrabold tracking-tight text-ink",
							children: "Measurable results, real impact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-xl text-center text-[14px] text-body",
							children: "Workshops using Cedric Masters Autos see significant improvements in efficiency and revenue."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 grid gap-5 lg:grid-cols-4",
							children: features.map((f) => {
								const Icon = f.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-line-soft bg-bg p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,70,229,0.08)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-10 place-items-center rounded-xl bg-accent text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[24px] font-extrabold tracking-tight text-ink",
												children: f.stat
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-1 text-[12px] font-semibold text-accent",
												children: f.statLabel
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-1.5 text-[14px] font-bold text-ink",
											children: f.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[12.5px] leading-relaxed text-body",
											children: f.desc
										})
									]
								}, f.title);
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] px-8 py-14 text-center text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-[28px] font-extrabold tracking-tight",
								children: "Ready to transform your workshop?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-3 max-w-md text-[14px] text-indigo-200",
								children: "Join 400+ Nigerian auto businesses already using Cedric Masters Autos."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex items-center justify-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth/login",
									className: "inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] bg-white px-5 text-[13px] font-semibold text-accent-deep shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all hover:bg-white/90",
									children: "Start free trial"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth/login",
									className: "inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] border border-indigo-300/40 px-5 text-[13px] font-semibold text-white/90 transition-all hover:bg-white/10",
									children: "Book a demo"
								})]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line-soft bg-surface py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6",
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
export { LandingFive as component };
