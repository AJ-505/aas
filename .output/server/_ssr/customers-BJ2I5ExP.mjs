import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconChevronRight, IconPlus, IconSearch } from "./icons-ON1WsQDq.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { customerQueries, useCheckInMutation, useCreateCustomerMutation, useCreateVehicleMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { Textarea } from "./textarea-CrQHCH19.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-BJ2I5ExP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [showCreate, setShowCreate] = (0, import_react.useState)(false);
	const { data: customers, isLoading } = useQuery(customerQueries.search(q));
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: "Customers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: customers ? `${customers.length} registered` : "Directory of customers and their vehicles."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setShowCreate((s) => !s),
					variant: showCreate ? "outline" : "default",
					children: showCreate ? "Close" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPlus, { size: 15 }), " Add customer"] })
				})]
			}),
			showCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCustomerForm, { onDone: () => setShowCreate(false) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconSearch, {
					size: 15,
					className: "absolute left-3 top-1/2 -translate-y-1/2 text-mute"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search by name or phone...",
					value: q,
					onChange: (e) => setQ(e.target.value),
					className: "pl-9"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Phone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "hidden md:table-cell",
						children: "Email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 4,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
				}) }) : !customers || customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					colSpan: 4,
					className: "py-10 text-center text-mute",
					children: [
						"No customers found",
						q ? ` for “${q}”` : "",
						"."
					]
				}) }) : customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer",
					onClick: () => navigate({
						to: "/service/customer/$id",
						params: { id: c._id }
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2.5 font-semibold text-ink",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
									name: c.name,
									size: 28
								}), c.name]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap text-body",
							children: c.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "hidden text-mute md:table-cell",
							children: c.email ?? "-"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "px-2 text-mute",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 15 })
						})
					]
				}, c._id)) })] })
			})
		]
	});
}
function CreateCustomerForm({ onDone }) {
	const queryClient = useQueryClient();
	const createCustomer = useCreateCustomerMutation();
	const createVehicle = useCreateVehicleMutation();
	const checkIn = useCheckInMutation();
	async function handleSubmit(event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = formData.get("name").trim();
		const phone = formData.get("phone").trim();
		const email = formData.get("email").trim();
		const address = formData.get("address").trim();
		if (!name || !phone) {
			zt.error("Name and phone are required.");
			return;
		}
		const make = formData.get("make").trim();
		const model = formData.get("model").trim();
		const yearStr = formData.get("year").trim();
		const color = formData.get("color").trim();
		const plate = formData.get("plate").trim();
		const vin = formData.get("vin").trim();
		const complaint = formData.get("complaint").trim();
		const hasVehicle = make && model && yearStr && color;
		if ((make || model || yearStr || color) && !hasVehicle) {
			zt.error("Please fill all required vehicle fields (make, model, year, colour) or leave all empty.");
			return;
		}
		try {
			const customerId = await createCustomer.mutateAsync({
				name,
				phone,
				email: email || void 0,
				address: address || void 0
			});
			let vehicleId = null;
			if (hasVehicle) vehicleId = await createVehicle.mutateAsync({
				ownerId: customerId,
				make,
				model,
				year: Number(yearStr),
				color,
				plate: plate || void 0,
				vin: vin || void 0,
				status: "customerOwned"
			});
			if (complaint && vehicleId) {
				await checkIn.mutateAsync({
					vehicleId,
					customerId,
					complaint
				});
				zt.success("Customer, vehicle, and job created.");
				queryClient.invalidateQueries();
				onDone();
				return;
			}
			zt.success("Customer created.");
			if (vehicleId) zt.success("Vehicle added.");
			queryClient.invalidateQueries();
			onDone();
		} catch (err) {
			zt.error(err instanceof Error ? err.message : "Failed to create customer.");
		}
	}
	const saving = createCustomer.isPending || createVehicle.isPending || checkIn.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "New customer" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Name *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							name: "name",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "Phone *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							name: "phone",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							name: "email",
							type: "email"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "address",
							children: "Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "address",
							name: "address"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-line-soft pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-3 text-[13px] font-bold text-ink",
					children: ["Vehicle ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-mute",
						children: "(optional)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "make",
								children: "Make"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "make",
								name: "make"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "model",
								children: "Model"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "model",
								name: "model"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "year",
								children: "Year"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "year",
								name: "year",
								type: "number",
								min: 1900
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "color",
								children: "Colour"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "color",
								name: "color"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "plate",
								children: "Plate"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "plate",
								name: "plate"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "vin",
								children: "VIN"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "vin",
								name: "vin"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-line-soft pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-3 text-[13px] font-bold text-ink",
					children: ["Complaint ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-mute",
						children: "(optional)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "complaint",
						children: "Describe the issue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "complaint",
						name: "complaint",
						placeholder: "Customer's reported complaint..."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: saving,
					children: saving ? "Saving..." : "Save customer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: onDone,
					children: "Cancel"
				})]
			})
		]
	}) })] });
}
//#endregion
export { CustomersPage as component };
