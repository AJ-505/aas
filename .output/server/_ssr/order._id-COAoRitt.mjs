import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconChevronRight } from "./icons-ON1WsQDq.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { deliveryQueries, salesOrderQueries, useCancelSalesOrderMutation, useCompleteDeliveryMutation, useCompleteSalesOrderMutation } from "./queries-DshR6pBd.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Route } from "./order._id-AUkMubBF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order._id-COAoRitt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SalesOrderDetailPage() {
	const { id } = Route.useParams();
	const queryClient = useQueryClient();
	const { data: order, isLoading, isError, error } = useQuery(salesOrderQueries.get(id));
	const { data: delivery } = useQuery(deliveryQueries.getBySalesOrder(id));
	const completeOrder = useCompleteSalesOrderMutation();
	const cancelOrder = useCancelSalesOrderMutation();
	useCompleteDeliveryMutation();
	const [showDelivery, setShowDelivery] = (0, import_react.useState)(false);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-rose-600",
			children: ["Error: ", error?.message]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/sales/orders",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to orders"
		})]
	});
	if (!order) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-mute",
			children: "Order not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/sales/orders",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to orders"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: ["Order #", order._id.slice(-6)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: ["Reserved ", new Date(order.reservedTs).toLocaleDateString("en-NG")]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/sales/orders",
					className: "flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
						size: 13,
						className: "rotate-180"
					}), " Back to orders"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Summary" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-mute",
						children: "Agreed Price"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-semibold text-ink",
						children: ["NGN ", (order.agreedPrice / 100).toLocaleString()]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-mute",
						children: "Deposit Paid"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-semibold text-ink",
						children: ["NGN ", (order.deposit / 100).toLocaleString()]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-mute",
						children: "Balance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "font-semibold text-ink",
						children: ["NGN ", (order.balance / 100).toLocaleString()]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-mute",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						dot: true,
						variant: order.status === "completed" ? "success" : order.status === "cancelled" ? "destructive" : "warning",
						children: order.status.charAt(0).toUpperCase() + order.status.slice(1)
					}) })] })
				]
			}) })] }),
			order.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: async () => {
						await completeOrder.mutateAsync({ salesOrderId: id }, {
							onSuccess: () => {
								zt.success("Order completed.");
								queryClient.invalidateQueries();
							},
							onError: (err) => zt.error(err.message)
						});
					},
					disabled: completeOrder.isPending,
					children: completeOrder.isPending ? "Completing..." : "Complete"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: async () => {
						await cancelOrder.mutateAsync({ salesOrderId: id }, {
							onSuccess: () => {
								zt.success("Order cancelled.");
								queryClient.invalidateQueries();
							},
							onError: (err) => zt.error(err.message)
						});
					},
					disabled: cancelOrder.isPending,
					children: cancelOrder.isPending ? "Cancelling..." : "Cancel"
				})]
			}),
			order.status === "completed" && !delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setShowDelivery(true),
					children: "Record delivery"
				})
			}),
			showDelivery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryForm, {
				salesOrderId: id,
				onDone: () => {
					setShowDelivery(false);
					queryClient.invalidateQueries();
				}
			}),
			delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Delivery" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-mute",
				children: ["Handed over on ", new Date(delivery.handedOverTs).toLocaleDateString("en-NG", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-2 space-y-1 text-[13px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: delivery.checklist.keys ? "text-green-600" : "text-mute",
						children: [delivery.checklist.keys ? "✓" : "✗", " Keys"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: delivery.checklist.manual ? "text-green-600" : "text-mute",
						children: [delivery.checklist.manual ? "✓" : "✗", " Manual"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: delivery.checklist.toolkit ? "text-green-600" : "text-mute",
						children: [delivery.checklist.toolkit ? "✓" : "✗", " Toolkit"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: delivery.checklist.inspection ? "text-green-600" : "text-mute",
						children: [delivery.checklist.inspection ? "✓" : "✗", " Inspection"]
					})
				]
			})] })] })
		]
	});
}
function DeliveryForm({ salesOrderId, onDone }) {
	const complete = useCompleteDeliveryMutation();
	const [checklist, setChecklist] = (0, import_react.useState)({
		keys: false,
		manual: false,
		toolkit: false,
		inspection: false
	});
	async function handleSubmit(e) {
		e.preventDefault();
		await complete.mutateAsync({
			salesOrderId,
			checklist
		}, {
			onSuccess: () => {
				zt.success("Delivery recorded.");
				onDone();
			},
			onError: (err) => zt.error(err.message)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Delivery Handover Checklist" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-3",
		children: [[
			"keys",
			"manual",
			"toolkit",
			"inspection"
		].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex items-center gap-3 rounded-lg border border-line-soft p-3 text-[13px] font-medium text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked: checklist[item],
				onChange: (e) => setChecklist((prev) => ({
					...prev,
					[item]: e.target.checked
				})),
				className: "size-4 rounded border-line accent-accent"
			}), item.charAt(0).toUpperCase() + item.slice(1)]
		}, item)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2 pt-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: complete.isPending,
				children: complete.isPending ? "Saving..." : "Confirm delivery"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onDone,
				children: "Cancel"
			})]
		})]
	}) })] });
}
//#endregion
export { SalesOrderDetailPage as component };
