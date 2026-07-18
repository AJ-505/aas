import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { ConvexAuthProvider, require_jsx_runtime, require_react, useAuth, useAuthActions } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconBanknote, IconBell, IconBox, IconCalendar, IconCar, IconChevronRight, IconGrid, IconLogOut, IconMenu, IconMoon, IconSearch, IconSliders, IconSun, IconTrendingUp, IconUsers, IconWrench } from "./icons-ON1WsQDq.mjs";
import { HeadContent, Link, Navigate, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useRouter, useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { MutationCache, QueryClient } from "../_libs/tanstack__query-core.mjs";
import { ConvexQueryClient, notifyManager } from "../_libs/@convex-dev/react-query+[...].mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { jobQueries, useBootstrapFirstAdminMutation, userQueries } from "./queries-DshR6pBd.mjs";
import "./label-Dfjt7mD7.mjs";
import { Fe, zt } from "../_libs/react-hot-toast.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
import { ROLES, ROLE_LABELS } from "./enums-qnepMgfE.mjs";
import { Route as Route$19 } from "./customer._id-GzOz6YgI.mjs";
import { useCurrentUser } from "./auth-BJb3cJTg.mjs";
import { Route as Route$20 } from "./job._id-CvIBBYGM.mjs";
import { Route as Route$21 } from "./lead._id-X8qWdf5g.mjs";
import { Route as Route$22 } from "./order._id-AUkMubBF.mjs";
import { setupRouterSsrQueryIntegration } from "../_libs/@tanstack/react-router-ssr-query+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-FRhcsDEM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ALL_STAFF = [...ROLES];
var NAV_GENERAL = [
	{
		label: "Dashboard",
		to: "/",
		icon: IconGrid,
		roles: ALL_STAFF,
		match: ["/"]
	},
	{
		label: "Appointments",
		to: "/service/appointments",
		icon: IconCalendar,
		roles: [
			"csr",
			"manager",
			"admin"
		],
		match: ["/service/appointments"]
	},
	{
		label: "Customers",
		to: "/service/customers",
		icon: IconUsers,
		roles: ALL_STAFF,
		match: ["/service/customer"]
	},
	{
		label: "Jobs",
		to: "/service/jobs",
		icon: IconWrench,
		roles: ALL_STAFF,
		match: ["/service/job", "/service/checkin"]
	}
];
var NAV_SALES = [
	{
		label: "Inventory",
		to: "/sales/inventory",
		icon: IconCar,
		roles: [
			"salesRep",
			"manager",
			"admin"
		],
		match: ["/sales/inventory"]
	},
	{
		label: "Leads",
		to: "/sales/leads",
		icon: IconTrendingUp,
		roles: [
			"salesRep",
			"manager",
			"admin"
		],
		match: ["/sales/lead"]
	},
	{
		label: "Orders",
		to: "/sales/orders",
		icon: IconBanknote,
		roles: [
			"salesRep",
			"manager",
			"admin"
		],
		match: ["/sales/order"]
	}
];
var NAV_OPS = [
	{
		label: "Parts",
		to: "/service/parts",
		icon: IconBox,
		roles: [
			"inventoryManager",
			"manager",
			"admin"
		],
		match: ["/service/parts"]
	},
	{
		label: "Finance",
		to: "/service/finance",
		icon: IconBanknote,
		roles: [
			"finance",
			"manager",
			"admin"
		],
		match: ["/service/finance"]
	},
	{
		label: "User Management",
		to: "/admin/users",
		icon: IconSliders,
		roles: ["admin"],
		match: ["/admin/users"]
	}
];
function canSee(item, role) {
	if (!role) return false;
	if (role === "admin") return true;
	return item.roles.includes(role);
}
function isActive(item, pathname) {
	if (item.to === "/") return pathname === "/";
	return item.match.some((m) => pathname.startsWith(m));
}
function breadcrumb(pathname) {
	if (pathname === "/") return ["Workshop", "Dashboard"];
	if (pathname.startsWith("/service/customers")) return ["Workshop", "Customers"];
	if (pathname.startsWith("/service/customer/")) return [
		"Workshop",
		"Customers",
		"Profile"
	];
	if (pathname.startsWith("/service/jobs")) return ["Workshop", "Jobs"];
	if (pathname.startsWith("/service/job/")) return [
		"Workshop",
		"Jobs",
		`#${pathname.split("/").pop()?.slice(-6)}`
	];
	if (pathname.startsWith("/service/checkin")) return [
		"Workshop",
		"Jobs",
		"Check in"
	];
	if (pathname.startsWith("/service/appointments")) return ["Workshop", "Appointments"];
	if (pathname.startsWith("/service/finance")) return ["Operations", "Finance"];
	if (pathname.startsWith("/service/parts")) return ["Operations", "Parts Catalogue"];
	if (pathname.startsWith("/sales/inventory")) return ["Sales", "Inventory"];
	if (pathname.startsWith("/sales/leads")) return ["Sales", "Leads"];
	if (pathname.startsWith("/sales/lead/")) return [
		"Sales",
		"Leads",
		"Detail"
	];
	if (pathname.startsWith("/sales/orders")) return ["Sales", "Orders"];
	if (pathname.startsWith("/sales/order/")) return [
		"Sales",
		"Orders",
		"Detail"
	];
	if (pathname.startsWith("/admin/users")) return ["Operations", "User Management"];
	return ["Workshop"];
}
function AppShell({ children }) {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { data: user, isLoading: userLoading } = useCurrentUser();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const router = useRouter();
	const queryClient = useQueryClient();
	const { signOut } = useAuthActions();
	const searchRef = (0, import_react.useRef)(null);
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(() => typeof window === "undefined" || window.innerWidth >= 768);
	const [profileOpen, setProfileOpen] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "light";
		return document.documentElement.classList.contains("dark") ? "dark" : "light";
	});
	const isLogin = pathname === "/auth/login";
	const { data: openJobsCount } = useQuery({
		...jobQueries.openCount(),
		enabled: !!user?.role && !isLogin
	});
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const stored = window.localStorage.getItem("theme");
		const nextTheme = stored === "dark" || stored === "light" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		document.documentElement.classList.toggle("dark", nextTheme === "dark");
		setTheme(nextTheme);
	}, []);
	function toggleTheme() {
		const nextTheme = theme === "dark" ? "light" : "dark";
		document.documentElement.classList.toggle("dark", nextTheme === "dark");
		window.localStorage.setItem("theme", nextTheme);
		setTheme(nextTheme);
	}
	if (isLogin) {
		if (isAuthenticated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative flex h-full items-center justify-center overflow-auto bg-bg p-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex w-full max-w-sm flex-col items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5 flex flex-col items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 place-items-center rounded-xl bg-accent text-sm font-extrabold text-white",
						children: "CM"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-lg font-extrabold tracking-tight text-ink",
							children: "Cedric Masters"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-mute",
							children: "Autos Management"
						})]
					})]
				}), children]
			})
		});
	}
	if (authLoading || isAuthenticated && userLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
	});
	if (!isAuthenticated || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/auth/login" });
	if (!user.role) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingRoleAssignment, {
		userId: user._id,
		userName: user.name
	});
	const role = user.role;
	const crumbs = breadcrumb(pathname);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("sticky top-0 h-screen w-[250px] shrink-0 flex-col border-r border-line bg-surface", sidebarOpen ? "fixed inset-y-0 left-0 z-30 flex md:sticky" : "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 px-[18px] pb-4 pt-[18px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-[34px] place-items-center rounded-[10px] bg-accent text-xs font-extrabold text-white",
							children: "CM"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-bold tracking-tight text-ink",
							children: "Cedric Masters"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[11px] text-mute",
							children: "Autos Management"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex-1 overflow-auto px-3 pb-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavSection, {
								label: "General",
								items: NAV_GENERAL,
								role,
								pathname,
								openJobsCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavSection, {
								label: "Sales",
								items: NAV_SALES,
								role,
								pathname,
								openJobsCount: void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavSection, {
								label: "Operations",
								items: NAV_OPS,
								role,
								pathname,
								openJobsCount
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "m-3 flex items-center gap-2.5 rounded-xl border border-line p-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								name: user.name ?? user.email ?? "?",
								size: 34
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-[13px] font-semibold text-ink",
									children: user.name ?? user.email
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11.5px] text-mute",
									children: ROLE_LABELS[role]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": "Sign out",
								title: "Sign out",
								className: "grid size-8 place-items-center rounded-lg text-mute transition-colors hover:bg-bg hover:text-rose-600",
								onClick: async () => {
									await signOut();
									await queryClient.invalidateQueries();
									router.navigate({ to: "/auth/login" });
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconLogOut, { size: 16 })
							})
						]
					})
				]
			}),
			sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-20 bg-black/20 md:hidden",
				"aria-label": "Close sidebar overlay",
				onClick: () => setSidebarOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-surface/80 px-7 backdrop-blur-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": sidebarOpen ? "Hide sidebar" : "Show sidebar",
							className: "grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface text-body hover:bg-accent-soft",
							onClick: () => setSidebarOpen((v) => !v),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMenu, { size: 17 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-1.5 text-[13px] text-mute",
							children: crumbs.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: i === crumbs.length - 1 ? "font-semibold text-ink" : "",
									children: c
								})]
							}, i))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-2 rounded-[9px] bg-line-soft px-3 py-[7px] text-mute transition-colors focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent/25 sm:flex sm:w-[280px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconSearch, { size: 15 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: searchRef,
										placeholder: "Search jobs, plates, customers…",
										className: "w-full border-none bg-transparent text-[13px] text-ink outline-none placeholder:text-mute",
										onKeyDown: (e) => {
											if (e.key === "Enter") router.navigate({ to: "/service/customers" });
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10.5px] text-mute",
										children: "⌘K"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"aria-label": "Notifications",
								className: "relative grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface text-body transition-colors hover:bg-accent-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBell, { size: 17 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-2 size-[7px] rounded-full border-[1.5px] border-white bg-rose-500" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": theme === "dark" ? "Use light mode" : "Use dark mode",
								className: "grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface text-body hover:bg-accent-soft",
								onClick: toggleTheme,
								children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconSun, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMoon, { size: 16 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "User menu",
									className: "grid size-[34px] place-items-center rounded-[9px] border border-line bg-surface transition-colors hover:bg-accent-soft",
									onClick: () => setProfileOpen((v) => !v),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
										name: user.name ?? user.email ?? "?",
										size: 28
									})
								}), profileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "fixed inset-0 z-30",
									onClick: () => setProfileOpen(false)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-b border-line px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-semibold text-ink",
												children: user.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs text-mute",
												children: user.email
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-b border-line px-4 py-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-medium uppercase tracking-wider text-mute",
												children: "Role"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-sm text-ink",
												children: ROLE_LABELS[role]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-1.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-mute transition-colors hover:bg-bg hover:text-rose-600",
												onClick: async () => {
													setProfileOpen(false);
													await signOut();
													await queryClient.invalidateQueries();
													router.navigate({ to: "/auth/login" });
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconLogOut, { size: 15 }), "Sign out"]
											})
										})
									]
								})] })]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-h-0 flex-1 overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-full max-w-[1360px] px-10 pb-20 pt-8",
						children
					})
				})]
			})
		]
	});
}
function NavSection({ label, items, role, pathname, openJobsCount }) {
	const visible = items.filter((i) => canSee(i, role));
	if (visible.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-mute",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-0.5",
		children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
			item,
			active: isActive(item, pathname),
			openJobsCount
		}, item.to))
	})] });
}
function NavLink({ item, active, openJobsCount }) {
	const openJobs = item.label === "Jobs" ? openJobsCount : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: item.to,
		className: cn("flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13.5px] font-medium text-body transition-colors hover:bg-bg hover:text-ink", active && "bg-accent-soft font-semibold text-accent-deep hover:bg-accent-soft hover:text-accent-deep"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { size: 17 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1",
				children: item.label
			}),
			openJobs != null && openJobs > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600", active && "bg-accent-soft text-accent-deep"),
				children: openJobs
			})
		]
	});
}
function PendingRoleAssignment({ userName }) {
	const queryClient = useQueryClient();
	const { data: adminExists } = useQuery(userQueries.adminExists());
	const bootstrap = useBootstrapFirstAdminMutation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center bg-bg p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "w-full max-w-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4 pt-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-xl font-bold text-ink",
						children: ["Welcome", userName ? `, ${userName}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] text-mute",
						children: "Your account has not been assigned a role yet. Please contact an administrator to get access."
					}),
					adminExists === false && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[13px] font-semibold text-amber-800",
								children: "No administrator has been set up yet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] text-amber-700",
								children: "If you are the first team member, you can claim the admin role to get started."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								onClick: () => bootstrap.mutate(void 0, { onSuccess: () => {
									zt.success("You are now an administrator.");
									queryClient.invalidateQueries();
								} }),
								disabled: bootstrap.isPending,
								children: bootstrap.isPending ? "Claiming..." : "Claim admin role"
							})
						]
					})
				]
			})
		})
	});
}
var app_default = "/assets/app-COb_m8y0.css";
var TanStackRouterDevtools = () => null;
var Route$18 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Cedric Masters Autos" }
		],
		links: [
			{
				rel: "stylesheet",
				href: app_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RootDocument, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) });
}
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-screen flex-col",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fe, { position: "top-right" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TanStackRouterDevtools, { position: "bottom-right" })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
	] })] });
}
var $$splitComponentImporter$17 = () => import("./routes-CZoptnNF.mjs");
var Route$17 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./parts-BJNw_G6R.mjs");
var Route$16 = createFileRoute("/service/parts")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./jobs-CPw3x7st.mjs");
var Route$15 = createFileRoute("/service/jobs")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./finance-BNKlyTCj.mjs");
var Route$14 = createFileRoute("/service/finance")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./customers-BJ2I5ExP.mjs");
var Route$13 = createFileRoute("/service/customers")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./checkin-BMoZDFzF.mjs");
var Route$12 = createFileRoute("/service/checkin")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./appointments-CgdHYxv4.mjs");
var Route$11 = createFileRoute("/service/appointments")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./orders-DsNJ688D.mjs");
var Route$10 = createFileRoute("/sales/orders")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./leads-1BdMBR8n.mjs");
var Route$9 = createFileRoute("/sales/leads")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./inventory-2HaBWjU5.mjs");
var Route$8 = createFileRoute("/sales/inventory")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./5-Cc0-4e1n.mjs");
var Route$7 = createFileRoute("/landing/5")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./4-4cDtV8cU.mjs");
var Route$6 = createFileRoute("/landing/4")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./3-BHoyAis1.mjs");
var Route$5 = createFileRoute("/landing/3")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./2-DLZvgIN8.mjs");
var Route$4 = createFileRoute("/landing/2")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./1-BrQW3Fyi.mjs");
var Route$3 = createFileRoute("/landing/1")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./reset-password-UCgaBmd0.mjs");
var Route$2 = createFileRoute("/auth/reset-password")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./login-Hd2vh6qY.mjs");
var Route$1 = createFileRoute("/auth/login")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./users-DPdlTg3s.mjs");
var Route = createFileRoute("/admin/users")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var ServicePartsRoute = Route$16.update({
	id: "/service/parts",
	path: "/service/parts",
	getParentRoute: () => Route$18
});
var ServiceJobsRoute = Route$15.update({
	id: "/service/jobs",
	path: "/service/jobs",
	getParentRoute: () => Route$18
});
var ServiceFinanceRoute = Route$14.update({
	id: "/service/finance",
	path: "/service/finance",
	getParentRoute: () => Route$18
});
var ServiceCustomersRoute = Route$13.update({
	id: "/service/customers",
	path: "/service/customers",
	getParentRoute: () => Route$18
});
var ServiceCheckinRoute = Route$12.update({
	id: "/service/checkin",
	path: "/service/checkin",
	getParentRoute: () => Route$18
});
var ServiceAppointmentsRoute = Route$11.update({
	id: "/service/appointments",
	path: "/service/appointments",
	getParentRoute: () => Route$18
});
var SalesOrdersRoute = Route$10.update({
	id: "/sales/orders",
	path: "/sales/orders",
	getParentRoute: () => Route$18
});
var SalesLeadsRoute = Route$9.update({
	id: "/sales/leads",
	path: "/sales/leads",
	getParentRoute: () => Route$18
});
var SalesInventoryRoute = Route$8.update({
	id: "/sales/inventory",
	path: "/sales/inventory",
	getParentRoute: () => Route$18
});
var Landing5Route = Route$7.update({
	id: "/landing/5",
	path: "/landing/5",
	getParentRoute: () => Route$18
});
var Landing4Route = Route$6.update({
	id: "/landing/4",
	path: "/landing/4",
	getParentRoute: () => Route$18
});
var Landing3Route = Route$5.update({
	id: "/landing/3",
	path: "/landing/3",
	getParentRoute: () => Route$18
});
var Landing2Route = Route$4.update({
	id: "/landing/2",
	path: "/landing/2",
	getParentRoute: () => Route$18
});
var Landing1Route = Route$3.update({
	id: "/landing/1",
	path: "/landing/1",
	getParentRoute: () => Route$18
});
var AuthResetPasswordRoute = Route$2.update({
	id: "/auth/reset-password",
	path: "/auth/reset-password",
	getParentRoute: () => Route$18
});
var AuthLoginRoute = Route$1.update({
	id: "/auth/login",
	path: "/auth/login",
	getParentRoute: () => Route$18
});
var AdminUsersRoute = Route.update({
	id: "/admin/users",
	path: "/admin/users",
	getParentRoute: () => Route$18
});
var ServiceJobIdRoute = Route$20.update({
	id: "/service/job/$id",
	path: "/service/job/$id",
	getParentRoute: () => Route$18
});
var ServiceCustomerIdRoute = Route$19.update({
	id: "/service/customer/$id",
	path: "/service/customer/$id",
	getParentRoute: () => Route$18
});
var SalesOrderIdRoute = Route$22.update({
	id: "/sales/order/$id",
	path: "/sales/order/$id",
	getParentRoute: () => Route$18
});
var rootRouteChildren = {
	IndexRoute,
	AdminUsersRoute,
	AuthLoginRoute,
	AuthResetPasswordRoute,
	Landing1Route,
	Landing2Route,
	Landing3Route,
	Landing4Route,
	Landing5Route,
	SalesInventoryRoute,
	SalesLeadsRoute,
	SalesOrdersRoute,
	ServiceAppointmentsRoute,
	ServiceCheckinRoute,
	ServiceCustomersRoute,
	ServiceFinanceRoute,
	ServiceJobsRoute,
	ServicePartsRoute,
	SalesLeadIdRoute: Route$21.update({
		id: "/sales/lead/$id",
		path: "/sales/lead/$id",
		getParentRoute: () => Route$18
	}),
	SalesOrderIdRoute,
	ServiceCustomerIdRoute,
	ServiceJobIdRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultCatchBoundary({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-rose-600",
			children: error.message || "Something went wrong"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "rounded-[9px] bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)] hover:bg-accent-deep",
			children: "Go home"
		})]
	});
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-mute",
			children: "404 - Page not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "rounded-[9px] bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(79,70,229,0.28)] hover:bg-accent-deep",
			children: "Go home"
		})]
	});
}
function getRouter() {
	if (typeof document !== "undefined") notifyManager.setScheduler(window.requestAnimationFrame);
	const convexQueryClient = new ConvexQueryClient("https://harmless-retriever-332.convex.cloud");
	const queryClient = new QueryClient({
		defaultOptions: { queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
			staleTime: 3e4
		} },
		mutationCache: new MutationCache({ onError: (error) => {
			zt.error(error.message ?? "Something went wrong");
		} })
	});
	convexQueryClient.connect(queryClient);
	const router = createRouter({
		routeTree,
		defaultPreload: "intent",
		defaultErrorComponent: DefaultCatchBoundary,
		defaultNotFoundComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFound, {}),
		context: { queryClient },
		Wrap: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvexAuthProvider, {
			client: convexQueryClient.convexClient,
			children
		}),
		scrollRestoration: true
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient
	});
	return router;
}
//#endregion
export { getRouter };
