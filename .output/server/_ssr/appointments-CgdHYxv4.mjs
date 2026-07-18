import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconChevronRight, IconPlus, IconX } from "./icons-ON1WsQDq.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { appointmentQueries, customerQueries, useCancelAppointmentMutation, useCheckInMutation, useCreateAppointmentMutation, useCreateCustomerMutation, useCreateVehicleMutation, useMarkAppointmentCheckedInMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { Textarea } from "./textarea-CrQHCH19.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/appointments-CgdHYxv4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APPOINTMENT_STATUS_VARIANTS = {
	scheduled: "info",
	checkedIn: "success",
	cancelled: "destructive"
};
var APPOINTMENT_STATUS_LABELS = {
	scheduled: "Scheduled",
	checkedIn: "Checked In",
	cancelled: "Cancelled"
};
function getRange(preset) {
	const now = /* @__PURE__ */ new Date();
	now.setHours(0, 0, 0, 0);
	const start = now.getTime();
	if (preset === "today") return {
		startDate: start,
		endDate: start + 864e5
	};
	if (preset === "week") return {
		startDate: start,
		endDate: start + 7 * 864e5
	};
	const nextMonth = new Date(now);
	nextMonth.setMonth(nextMonth.getMonth() + 1);
	return {
		startDate: start,
		endDate: nextMonth.getTime()
	};
}
var RANGE_LABELS = {
	today: "Today",
	week: "This Week",
	month: "This Month"
};
function groupByDay(appointments) {
	const groups = [];
	for (const a of appointments) {
		const dayKey = new Date(a.appointmentTs).toDateString();
		const dayTs = new Date(a.appointmentTs);
		dayTs.setHours(0, 0, 0, 0);
		const existing = groups[groups.length - 1];
		if (existing && existing.date === dayKey) existing.items.push(a);
		else groups.push({
			date: dayKey,
			ts: dayTs.getTime(),
			items: [a]
		});
	}
	return groups;
}
function AppointmentsPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [preset, setPreset] = (0, import_react.useState)("week");
	const [showCreate, setShowCreate] = (0, import_react.useState)(false);
	const { startDate, endDate } = getRange(preset);
	const { data: appointments, isLoading } = useQuery(appointmentQueries.listRange(startDate, endDate));
	const dayGroups = appointments ? groupByDay(appointments) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: "Appointments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: appointments ? `${appointments.length} upcoming` : "Manage service appointments."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1 rounded-xl border border-line bg-surface p-0.5",
						children: Object.keys(RANGE_LABELS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${preset === key ? "bg-accent text-white" : "text-mute hover:text-ink"}`,
							onClick: () => setPreset(key),
							children: RANGE_LABELS[key]
						}, key))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setShowCreate(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPlus, { size: 15 }), " Book appointment"]
					})]
				})]
			}),
			showCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateAppointmentForm, { onDone: () => {
				setShowCreate(false);
				queryClient.invalidateQueries();
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date / Time" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Phone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Vehicle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Complaint" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "w-24",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
				}) }) : !appointments || appointments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 7,
					className: "py-10 text-center text-mute",
					children: "No appointments in this range."
				}) }) : dayGroups.flatMap((group) => [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, {
					className: "bg-line-soft/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						colSpan: 7,
						className: "py-2 pl-4 text-[12px] font-semibold text-mute",
						children: [
							new Date(group.date).toLocaleDateString("en-NG", {
								weekday: "long",
								day: "numeric",
								month: "short",
								year: group.ts < Date.now() - 6 * 864e5 || group.ts > Date.now() + 6 * 864e5 ? "numeric" : void 0
							}),
							" — ",
							group.items.length,
							" appointment",
							group.items.length !== 1 ? "s" : ""
						]
					})
				}, group.date), ...group.items.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "whitespace-nowrap font-semibold text-ink",
						children: new Date(a.appointmentTs).toLocaleTimeString("en-NG", {
							hour: "2-digit",
							minute: "2-digit"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "whitespace-nowrap text-body",
						children: a.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "whitespace-nowrap text-mute",
						children: a.phone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-body",
						children: [
							a.vehicleMake,
							a.vehicleModel,
							a.vehiclePlate
						].filter(Boolean).join(" ") || "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "max-w-[200px] truncate text-mute",
						children: a.complaint ?? "-"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						dot: true,
						variant: APPOINTMENT_STATUS_VARIANTS[a.status] ?? "secondary",
						children: APPOINTMENT_STATUS_LABELS[a.status]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [a.status === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppointmentCheckInButton, {
							appointment: a,
							onDone: () => void queryClient.invalidateQueries()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CancelButton, {
							appointmentId: a._id,
							onDone: () => void queryClient.invalidateQueries()
						})]
					}), a.status === "checkedIn" && a.checkInJobId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => navigate({
							to: "/service/job/$id",
							params: { id: a.checkInJobId }
						}),
						children: ["View job ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 13 })]
					})] })
				] }, a._id))]) })] })
			})
		]
	});
}
function AppointmentCheckInButton({ appointment, onDone }) {
	const [loading, setLoading] = (0, import_react.useState)(false);
	const checkIn = useCheckInMutation();
	const markCheckedIn = useMarkAppointmentCheckedInMutation();
	const createCustomer = useCreateCustomerMutation();
	const createVehicle = useCreateVehicleMutation();
	const queryClient = useQueryClient();
	async function handleCheckIn() {
		setLoading(true);
		try {
			const customers = await queryClient.fetchQuery(customerQueries.search(appointment.phone));
			let customerId;
			if (customers && customers.length > 0) customerId = customers[0]._id;
			else customerId = await createCustomer.mutateAsync({
				name: appointment.name,
				phone: appointment.phone
			});
			const hasVehicle = !!(appointment.vehicleMake && appointment.vehicleModel);
			let vehicleId = null;
			if (hasVehicle) vehicleId = await createVehicle.mutateAsync({
				ownerId: customerId,
				make: appointment.vehicleMake,
				model: appointment.vehicleModel,
				year: (/* @__PURE__ */ new Date()).getFullYear(),
				color: "N/A",
				plate: appointment.vehiclePlate || void 0,
				status: "customerOwned"
			});
			if (vehicleId && appointment.complaint) {
				const jobId = await checkIn.mutateAsync({
					vehicleId,
					customerId,
					complaint: appointment.complaint
				});
				await markCheckedIn.mutateAsync({
					appointmentId: appointment._id,
					jobId
				});
			}
			zt.success("Appointment checked in.");
			onDone();
		} catch (err) {
			zt.error(err instanceof Error ? err.message : "Check-in failed.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "default",
		size: "sm",
		onClick: handleCheckIn,
		disabled: loading,
		children: loading ? "..." : "Check in"
	});
}
function CancelButton({ appointmentId, onDone }) {
	const cancel = useCancelAppointmentMutation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "sm",
		onClick: async () => {
			await cancel.mutateAsync({ appointmentId });
			zt.success("Appointment cancelled.");
			onDone();
		},
		disabled: cancel.isPending,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconX, { size: 14 })
	});
}
function CreateAppointmentForm({ onDone }) {
	const create = useCreateAppointmentMutation();
	async function handleSubmit(e) {
		e.preventDefault();
		const f = new FormData(e.currentTarget);
		const name = f.get("name").trim();
		const phone = f.get("phone").trim();
		if (!name || !phone) {
			zt.error("Name and phone are required.");
			return;
		}
		const dateStr = f.get("date");
		const timeStr = f.get("time");
		if (!dateStr || !timeStr) {
			zt.error("Date and time are required.");
			return;
		}
		const appointmentTs = (/* @__PURE__ */ new Date(`${dateStr}T${timeStr}`)).getTime();
		if (isNaN(appointmentTs)) {
			zt.error("Invalid date or time.");
			return;
		}
		await create.mutateAsync({
			name,
			phone,
			email: f.get("email").trim() || void 0,
			vehicleMake: f.get("vehicleMake").trim() || void 0,
			vehicleModel: f.get("vehicleModel").trim() || void 0,
			vehiclePlate: f.get("vehiclePlate").trim() || void 0,
			complaint: f.get("complaint").trim() || void 0,
			appointmentTs
		}, {
			onSuccess: () => {
				zt.success("Appointment booked.");
				onDone();
			},
			onError: (err) => zt.error(err.message)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Book appointment" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "date",
					children: "Date *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "date",
					name: "date",
					type: "date",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "time",
					children: "Time *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "time",
					name: "time",
					type: "time",
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "vehicleMake",
					children: "Vehicle make"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "vehicleMake",
					name: "vehicleMake"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "vehicleModel",
					children: "Vehicle model"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "vehicleModel",
					name: "vehicleModel"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "vehiclePlate",
					children: "Plate"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "vehiclePlate",
					name: "vehiclePlate"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:col-span-2 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "complaint",
					children: "Complaint"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "complaint",
					name: "complaint",
					rows: 2
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: create.isPending,
					children: create.isPending ? "Booking..." : "Book appointment"
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
export { AppointmentsPage as component };
