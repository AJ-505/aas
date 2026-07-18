import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { buttonVariants } from "./button-Ybh41ULA.mjs";
import { IconBanknote, IconCar, IconUsers, IconWrench, IconZap } from "./icons-ON1WsQDq.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/1-BrQW3Fyi.js
var import_jsx_runtime = require_jsx_runtime();
var features = [
	{
		icon: IconWrench,
		title: "Workshop management",
		desc: "Track jobs from check-in to completion with real-time status updates and technician assignment."
	},
	{
		icon: IconCar,
		title: "Inventory & parts",
		desc: "Manage stock, track usage, and automate reordering so your shop never runs dry."
	},
	{
		icon: IconUsers,
		title: "Customer CRM",
		desc: "Keep a complete service history for every customer with vehicle profiles and communication logs."
	},
	{
		icon: IconBanknote,
		title: "Finance & invoicing",
		desc: "Generate estimates, invoices, and receipts. Track payments and outstanding balances in real time."
	}
];
function LandingOne() {
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
						children: "Get started"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-5xl px-6 pt-20 pb-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-surface px-4 py-1.5 text-[12px] font-semibold text-mute shadow-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconZap, {
							size: 13,
							className: "text-accent"
						}), "Built for Nigerian auto workshops and dealerships"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-8 text-[42px] font-extrabold leading-[1.1] tracking-tight text-ink",
						children: [
							"Workshop management",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"that keeps your shop moving."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-body",
						children: "From check-in to checkout, Cedric Masters Autos gives you one platform to manage service jobs, customer relationships, parts inventory, and vehicle sales. No spreadsheets, no missed follow-ups."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-center gap-3",
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
							children: "View demo"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-6xl px-6 pb-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_12px_40px_rgba(15,18,34,0.06)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 border-b border-line-soft bg-bg px-5 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-rose-400" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-amber-300" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-emerald-400" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-3 text-[11px] font-semibold text-mute",
								children: "Dashboard preview"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-3",
							children: [
								{
									label: "Open jobs",
									value: "12",
									trend: "+3 today"
								},
								{
									label: "In progress",
									value: "08",
									trend: "4 technicians"
								},
								{
									label: "Ready for pickup",
									value: "05",
									trend: "Awaiting collection"
								},
								{
									label: "Revenue this month",
									value: "NGN 4.8M",
									trend: "+22% vs last month"
								}
							].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-line-soft bg-surface p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold text-mute",
										children: stat.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-[18px] font-extrabold tracking-tight text-ink",
										children: stat.value
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 text-[11px] font-medium text-emerald-600",
										children: stat.trend
									})
								]
							}, stat.label))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-line-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-6 border-b border-line-soft px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-mute",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-24",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1",
											children: "Vehicle"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1",
											children: "Customer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden w-28 lg:block",
											children: "Checked in"
										})
									]
								}), [
									{
										status: "In progress",
										vehicle: "Toyota Camry",
										customer: "Emeka Okafor",
										time: "09:15 AM"
									},
									{
										status: "Waiting parts",
										vehicle: "Honda Accord",
										customer: "Chioma Nwachukwu",
										time: "10:30 AM"
									},
									{
										status: "Ready",
										vehicle: "Mercedes C300",
										customer: "Tunde Balogun",
										time: "11:00 AM"
									}
								].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-6 border-b border-line-soft px-4 py-3 last:border-0 text-[13px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-24 font-semibold text-ink",
											children: row.status
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 text-body",
											children: row.vehicle
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 text-body",
											children: row.customer
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden w-28 text-mute lg:block",
											children: row.time
										})
									]
								}, row.vehicle))]
							})
						})]
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
							children: "Everything you need to run your workshop"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-3 max-w-xl text-center text-[14px] text-body",
							children: "One platform covering service, sales, inventory, and customer management."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
							children: features.map((f) => {
								const Icon = f.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-line-soft bg-bg p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,18,34,0.06)]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-10 place-items-center rounded-xl bg-accent-soft text-accent",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
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
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line-soft bg-bg py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[13px] font-semibold text-mute",
						children: "© 2026 Cedric Masters Autos. All rights reserved."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-5 text-[12px] text-mute",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Privacy policy" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Terms of service" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact" })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { LandingOne as component };
