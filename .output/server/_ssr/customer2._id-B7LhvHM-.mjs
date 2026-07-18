import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconChevronRight, IconMail, IconPhone } from "./icons-ON1WsQDq.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { customerQueries, jobQueries, useCreateVehicleMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
import { JOB_STATUS_LABELS, VEHICLE_STATUS_LABELS } from "./enums-qnepMgfE.mjs";
import { Route } from "./customer._id-GzOz6YgI.mjs";
import { JOB_STATUS_VARIANTS, VEHICLE_STATUS_VARIANTS } from "./status-ui-BhxZ5PXL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customer2._id-B7LhvHM-.js
var import_jsx_runtime = require_jsx_runtime();
function CustomerDetailPage() {
	const { id: customerId } = Route.useParams();
	const { data, isLoading, isError, error } = useQuery(customerQueries.detail(customerId));
	const navigate = useNavigate();
	const { data: jobHistory } = useQuery(jobQueries.byCustomer(customerId));
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-rose-600",
			children: ["Error loading customer: ", error?.message ?? "Unknown error"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/service/customers",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to customers"
		})]
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-mute",
			children: "Customer not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/service/customers",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to customers"
		})]
	});
	const { customer, vehicles } = data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						name: customer.name,
						size: 52
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-[23px] font-extrabold tracking-tight text-ink",
							children: customer.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-mute",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPhone, { size: 13 }),
									" ",
									customer.phone
								]
							}), customer.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMail, { size: 13 }),
									" ",
									customer.email
								]
							})]
						}),
						customer.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] text-mute",
							children: customer.address
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/service/customers",
					className: "flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
						size: 13,
						className: "rotate-180"
					}), " Back to customers"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Vehicles" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600",
						children: vehicles.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Plate" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vehicle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Colour" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: vehicles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 4,
					className: "py-10 text-center text-mute",
					children: "No vehicles recorded yet."
				}) }) : vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "whitespace-nowrap font-semibold uppercase tracking-wide text-ink",
						children: v.plate ?? "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "whitespace-nowrap text-body",
						children: [
							v.make,
							" ",
							v.model,
							" (",
							v.year,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-body",
						children: v.color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						dot: true,
						variant: VEHICLE_STATUS_VARIANTS[v.status] ?? "secondary",
						children: VEHICLE_STATUS_LABELS[v.status]
					}) })
				] }, v._id)) })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddVehicleForm, { customerId }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Repair History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-line-soft px-2 py-0.5 text-[11px] font-bold text-slate-600",
						children: [jobHistory?.length ?? 0, " jobs"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vehicle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Complaint" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: !jobHistory || jobHistory.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-mute",
					children: "No service history recorded yet."
				}) }) : jobHistory.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer",
					onClick: () => navigate({
						to: "/service/job/$id",
						params: { id: j._id }
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap text-body",
							children: new Date(j.checkInTs).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap text-body",
							children: j.vehicle ? `${j.vehicle.make} ${j.vehicle.model} (${j.vehicle.year})` : "-"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-[240px] truncate text-mute",
							children: j.complaint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							dot: true,
							variant: JOB_STATUS_VARIANTS[j.status] ?? "secondary",
							children: JOB_STATUS_LABELS[j.status]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "px-2 text-mute",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 15 })
						})
					]
				}, j._id)) })] })]
			})
		]
	});
}
function AddVehicleForm({ customerId }) {
	const queryClient = useQueryClient();
	const create = useCreateVehicleMutation();
	async function handleSubmit(event) {
		event.preventDefault();
		const f = new FormData(event.currentTarget);
		const make = f.get("make").trim();
		const model = f.get("model").trim();
		const color = f.get("color").trim();
		const year = Number(f.get("year"));
		const plate = f.get("plate").trim();
		const vin = f.get("vin").trim();
		if (!make || !model || !color || !year) {
			zt.error("Make, model, colour and year are required.");
			return;
		}
		await create.mutateAsync({
			ownerId: customerId,
			make,
			model,
			year,
			color,
			plate: plate || void 0,
			vin: vin || void 0,
			status: "customerOwned"
		}, { onSuccess: () => {
			zt.success("Vehicle added.");
			queryClient.invalidateQueries();
			event.target.reset();
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Add vehicle" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "grid gap-4 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "make",
					children: "Make *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "make",
					name: "make",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "model",
					children: "Model *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "model",
					name: "model",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "year",
					children: "Year *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "year",
					name: "year",
					type: "number",
					min: 1900,
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "color",
					children: "Colour *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "color",
					name: "color",
					required: true
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: create.isPending,
					children: create.isPending ? "Saving..." : "Add vehicle"
				})
			})
		]
	}) })] });
}
//#endregion
export { CustomerDetailPage as component };
