import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconCar, IconCheck, IconChevronRight, IconSearch } from "./icons-ON1WsQDq.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { customerQueries, useCheckInMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Textarea } from "./textarea-CrQHCH19.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkin-BMoZDFzF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CheckInPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const checkIn = useCheckInMutation();
	const [search, setSearch] = (0, import_react.useState)("");
	const [selectedCustomerId, setSelectedCustomerId] = (0, import_react.useState)(null);
	const [selectedVehicleId, setSelectedVehicleId] = (0, import_react.useState)(null);
	const [complaint, setComplaint] = (0, import_react.useState)("");
	const { data: customers } = useQuery({
		...customerQueries.search(search),
		enabled: search.length > 0
	});
	const { data: customerDetail } = useQuery({
		...customerQueries.detail(selectedCustomerId ?? ""),
		enabled: !!selectedCustomerId
	});
	const selectedCustomer = customerDetail?.customer ?? null;
	const vehicles = customerDetail?.vehicles ?? [];
	async function handleSubmit() {
		if (!selectedVehicleId || !selectedCustomerId || !complaint.trim()) {
			zt.error("Please select a customer, vehicle, and enter a complaint.");
			return;
		}
		checkIn.mutate({
			vehicleId: selectedVehicleId,
			customerId: selectedCustomerId,
			complaint: complaint.trim()
		}, {
			onSuccess: (jobId) => {
				zt.success("Job checked in successfully.");
				queryClient.invalidateQueries();
				navigate({
					to: "/service/job/$id",
					params: { id: jobId }
				});
			},
			onError: (err) => {
				zt.error(err instanceof Error ? err.message : "Failed to check in job.");
			}
		});
	}
	function handleSelectCustomer(id) {
		setSelectedCustomerId(id);
		setSelectedVehicleId(null);
		setSearch("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: "Check in vehicle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: "Create a new workshop job in three steps."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/service/jobs",
					className: "flex items-center gap-1 pt-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
						size: 13,
						className: "rotate-180"
					}), " Back to jobs"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepCard, {
				step: 1,
				title: "Customer",
				done: !!selectedCustomer,
				children: selectedCustomer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							name: selectedCustomer.name,
							size: 36
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[13.5px] font-semibold text-ink",
							children: selectedCustomer.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[12px] text-mute",
							children: selectedCustomer.phone
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setSelectedCustomerId(null);
							setSelectedVehicleId(null);
						},
						children: "Change"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "search",
							children: "Search by name or phone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconSearch, {
								size: 15,
								className: "absolute left-3 top-1/2 -translate-y-1/2 text-mute"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "search",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								placeholder: "Type to search...",
								className: "pl-9"
							})]
						}),
						customers && customers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute z-10 mt-1 w-full overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_12px_32px_rgba(15,18,34,0.12)]",
							children: customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-bg",
								onClick: () => handleSelectCustomer(c._id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
									name: c.name,
									size: 26
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[13px] font-semibold text-ink",
									children: c.name
								}), c.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11.5px] text-mute",
									children: c.phone
								})] })]
							}, c._id))
						}),
						search.length > 0 && customers && customers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[12.5px] text-mute",
							children: [
								"No matches. Add them first from the",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/service/customers",
									className: "font-semibold text-accent hover:underline",
									children: "Customers"
								}),
								" page."
							]
						})
					]
				})
			}),
			selectedCustomerId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepCard, {
				step: 2,
				title: "Vehicle",
				done: !!selectedVehicleId,
				children: vehicles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-mute",
					children: "No vehicles found for this customer."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2",
					children: vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-colors", selectedVehicleId === v._id ? "border-accent bg-accent-soft" : "border-line hover:bg-bg"),
						onClick: () => setSelectedVehicleId(v._id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-8 shrink-0 place-items-center rounded-lg", selectedVehicleId === v._id ? "bg-accent text-white" : "bg-accent-soft text-accent"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCar, { size: 15 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-[13px] font-semibold text-ink",
									children: [
										v.make,
										" ",
										v.model,
										" (",
										v.year,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-[11.5px] text-mute",
									children: [v.plate ? v.plate.toUpperCase() : "No plate", v.color ? ` · ${v.color}` : ""]
								})]
							}),
							selectedVehicleId === v._id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-5 place-items-center rounded-full bg-accent text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, { size: 11 })
							})
						]
					}, v._id))
				})
			}),
			selectedVehicleId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepCard, {
				step: 3,
				title: "Complaint",
				done: complaint.trim().length > 0,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "complaint",
							children: "Describe the issue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "complaint",
							value: complaint,
							onChange: (e) => setComplaint(e.target.value),
							placeholder: "Customer's reported complaint..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleSubmit,
							disabled: checkIn.isPending,
							children: checkIn.isPending ? "Checking in..." : "Check In Vehicle"
						})
					]
				})
			})
		]
	});
}
function StepCard({ step, title, done, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex-row items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("grid size-6 place-items-center rounded-full text-[11px] font-bold", done ? "bg-accent text-white" : "bg-accent-soft text-accent"),
			children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, { size: 12 }) : step
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: title })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children })] });
}
//#endregion
export { CheckInPage as component };
