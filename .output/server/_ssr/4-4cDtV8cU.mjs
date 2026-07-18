import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { buttonVariants } from "./button-Ybh41ULA.mjs";
import { IconBanknote, IconCar, IconUsers, IconWrench, IconZap } from "./icons-ON1WsQDq.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/4-4cDtV8cU.js
var import_jsx_runtime = require_jsx_runtime();
var features = [
	{
		icon: IconWrench,
		title: "Job control",
		desc: "Every repair tracked from drop-off to handover. No more sticky notes."
	},
	{
		icon: IconBanknote,
		title: "Billing",
		desc: "Estimates, invoices, receipts. One click, professional layout."
	},
	{
		icon: IconCar,
		title: "Vehicle history",
		desc: "Every service, every part, every visit. Instantly searchable."
	},
	{
		icon: IconUsers,
		title: "CRM",
		desc: "Know your customers. Service reminders, follow-ups, and loyalty tracking."
	}
];
function LandingFour() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-surface",
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-6xl px-6 pt-24 pb-32",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconZap, { size: 14 }), "Cedric Masters Autos"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-4 text-[58px] font-extrabold leading-[0.95] tracking-tight text-ink",
							children: [
								"Workshop",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"management",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: "simplified"
								}),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-lg text-[15px] leading-relaxed text-body",
							children: "Stop juggling spreadsheets and WhatsApp messages. Cedric Masters Autos gives you a single source of truth for your workshop and dealership operations."
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
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-line-soft bg-bg py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-12 md:grid-cols-2",
						children: features.map((f, i) => {
							const Icon = f.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 19 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-[17px] font-bold text-ink",
									children: f.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[14px] leading-relaxed text-body",
									children: f.desc
								})] })]
							}, f.title);
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl px-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-[28px] font-extrabold tracking-tight text-ink",
							children: "Ready to modernise your workshop?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[14px] text-body",
							children: "Join hundreds of Nigerian auto businesses already using Cedric Masters Autos."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth/login",
								className: buttonVariants({ size: "lg" }),
								children: "Get started for free"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line-soft py-10",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact" })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { LandingFour as component };
