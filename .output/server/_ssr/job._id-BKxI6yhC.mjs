import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconCar, IconCheck, IconChevronRight, IconUsers } from "./icons-ON1WsQDq.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { jobQueries, labourTypeQueries, partQueries, useAddJobItemMutation, useApproveInvoiceMutation, useAssignMutation, useCompleteMutation, useCreatePartsRequestMutation, useDiagnoseMutation, useDispatchPartsRequestMutation, useGenerateInvoiceMutation, useMarkPaidMutation, useMarkReadyMutation, useRecordPaymentMutation, useRemoveJobItemMutation, useReviewPartsRequestMutation, useStartWorkMutation, userQueries } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { Textarea } from "./textarea-CrQHCH19.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
import { JOB_ITEM_TYPE_LABELS, JOB_STATUSES, JOB_STATUS_LABELS, PARTS_REQUEST_STATUS_LABELS } from "./enums-qnepMgfE.mjs";
import { JOB_STATUS_VARIANTS, PARTS_REQUEST_VARIANTS } from "./status-ui-BhxZ5PXL.mjs";
import { formatDateTime, formatNaira } from "./format-Kc-5lS8-.mjs";
import { useCurrentUser } from "./auth-BJb3cJTg.mjs";
import { Route } from "./job._id-CvIBBYGM.mjs";
import { Select } from "./select-CEiMGzFC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/job._id-BKxI6yhC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TRANSITIONS = {
	checkedIn: ["assigned"],
	assigned: ["diagnosed"],
	diagnosed: ["waitingRelease", "inProgress"],
	waitingRelease: ["inProgress", "diagnosed"],
	inProgress: ["readyForPickup"],
	readyForPickup: ["completed"],
	completed: ["paid"],
	paid: []
};
function nextStatuses(from) {
	return TRANSITIONS[from] ?? [];
}
function JobDetailPage() {
	const { id: jobId } = Route.useParams();
	const { data, isLoading } = useQuery(jobQueries.detail(jobId));
	const { data: me } = useCurrentUser();
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	if (!data || !data.job) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-mute",
			children: "Job not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/service/jobs",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to jobs"
		})]
	});
	const { job, vehicle, customer, technician, csr, jobItems, partsRequests, invoice, payments } = data;
	const canActOnJob = me?.role === "admin" || me?.role === "manager" || me?.role === "technician" && (!job.technicianId || job.technicianId === me._id) || me?.role === "csr" && ["checkedIn", "readyForPickup"].includes(job.status);
	const allowedNext = nextStatuses(job.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/service/jobs",
					className: "flex w-fit items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
						size: 13,
						className: "rotate-180"
					}), " Back to jobs"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-[23px] font-extrabold tracking-tight text-ink",
						children: ["Job #", job._id.slice(-6)]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						dot: true,
						variant: JOB_STATUS_VARIANTS[job.status] ?? "secondary",
						children: JOB_STATUS_LABELS[job.status]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: [
						"Checked in ",
						formatDateTime(job.checkInTs),
						technician ? ` · Technician: ${technician.name}` : "",
						csr ? ` · Front desk: ${csr.name}` : ""
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-x-auto px-[18px] py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusStepper, { status: job.status })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex-row items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCar, { size: 14 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Vehicle" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-1 text-[13px]",
					children: vehicle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold text-ink",
							children: [
								vehicle.make,
								" ",
								vehicle.model,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-normal text-mute",
									children: [
										"(",
										vehicle.year,
										")"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-mute",
							children: ["Colour: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-body",
								children: vehicle.color
							})]
						}),
						vehicle.plate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-mute",
							children: ["Plate: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium uppercase tracking-wide text-body",
								children: vehicle.plate
							})]
						}),
						vehicle.vin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-mute",
							children: ["VIN: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-body",
								children: vehicle.vin
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-mute",
						children: "Vehicle not found."
					})
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex-row items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconUsers, { size: 14 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Customer" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-1 text-[13px]",
					children: customer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							name: customer.name,
							size: 36
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-ink",
								children: customer.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-mute",
								children: customer.phone
							}),
							customer.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-mute",
								children: customer.email
							})
						] })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-mute",
						children: "Customer not found."
					})
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Complaint" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] leading-relaxed text-body",
				children: job.complaint
			}), job.diagnosis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-line-soft pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-bold uppercase tracking-[0.07em] text-mute",
					children: "Diagnosis"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-[13px] leading-relaxed text-body",
					children: job.diagnosis
				})]
			})] })] }),
			allowedNext.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusActions, {
				jobId: job._id,
				allowedNext
			}),
			job.status === "checkedIn" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignTechnician, { jobId: job._id }),
			job.status === "assigned" && canActOnJob && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagnosisForm, { jobId: job._id }),
			[
				"diagnosed",
				"waitingRelease",
				"inProgress"
			].includes(job.status) && canActOnJob && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddJobItemForm, { jobId: job._id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobItemsTable, {
				jobItems,
				canRemove: canActOnJob && [
					"diagnosed",
					"waitingRelease",
					"inProgress"
				].includes(job.status)
			}),
			[
				"diagnosed",
				"waitingRelease",
				"inProgress"
			].includes(job.status) && canActOnJob && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePartsRequestForm, { jobId: job._id }),
			partsRequests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartsRequestsList, { partsRequests }),
			job.status !== "checkedIn" && job.status !== "assigned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceSection, {
				jobId: job._id,
				invoice,
				payments,
				hasItems: jobItems.length > 0
			}),
			job.status === "completed" && (me?.role === "finance" || me?.role === "manager" || me?.role === "admin") && invoice?.paid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkPaidButton, { jobId: job._id })
		]
	});
}
function StatusStepper({ status }) {
	const current = JOB_STATUSES.indexOf(status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-w-max items-center",
		children: JOB_STATUSES.map((s, i) => {
			const done = i < current;
			const active = i === current;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid size-6 place-items-center rounded-full border-2 transition-colors", done && "border-accent bg-accent text-white", active && "border-accent bg-accent-soft text-accent", !done && !active && "border-line bg-white text-mute"),
						children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", active ? "bg-accent" : "bg-line") })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide", active ? "text-accent-deep" : done ? "text-body" : "text-mute"),
						children: JOB_STATUS_LABELS[s]
					})]
				}), i < JOB_STATUSES.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mx-2 mb-5 h-0.5 w-8 rounded-full sm:w-10", i < current ? "bg-accent" : "bg-line-soft") })]
			}, s);
		})
	});
}
function StatusActions({ jobId, allowedNext }) {
	const queryClient = useQueryClient();
	const { data: me } = useCurrentUser();
	const startWork = useStartWorkMutation();
	const markReady = useMarkReadyMutation();
	const complete = useCompleteMutation();
	function invalidate() {
		queryClient.invalidateQueries();
	}
	function handleTransition(target) {
		const opts = { onSuccess: () => {
			zt.success(`Job moved to ${JOB_STATUS_LABELS[target]}`);
			invalidate();
		} };
		if (target === "inProgress") startWork.mutate({ jobId }, opts);
		else if (target === "readyForPickup") markReady.mutate({ jobId }, opts);
		else if (target === "completed") complete.mutate({ jobId }, opts);
	}
	const role = me?.role;
	const canStartWork = role === "technician" || role === "manager" || role === "admin";
	const canMarkReady = role === "technician" || role === "manager" || role === "admin";
	const canComplete = role === "csr" || role === "manager" || role === "admin";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Actions" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex flex-wrap gap-2",
		children: [
			allowedNext.includes("inProgress") && canStartWork && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => handleTransition("inProgress"),
				disabled: startWork.isPending,
				children: startWork.isPending ? "Starting..." : "Start Work"
			}),
			allowedNext.includes("readyForPickup") && canMarkReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => handleTransition("readyForPickup"),
				disabled: markReady.isPending,
				children: markReady.isPending ? "Updating..." : "Mark Ready for Pickup"
			}),
			allowedNext.includes("completed") && canComplete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => handleTransition("completed"),
				disabled: complete.isPending,
				children: complete.isPending ? "Completing..." : "Mark Completed"
			})
		]
	})] });
}
function AssignTechnician({ jobId }) {
	const queryClient = useQueryClient();
	const { data: techs } = useQuery(userQueries.listTechnicians());
	const assign = useAssignMutation();
	const [techId, setTechId] = (0, import_react.useState)("");
	function handleAssign() {
		if (!techId) {
			zt.error("Select a technician.");
			return;
		}
		assign.mutate({
			jobId,
			technicianId: techId
		}, { onSuccess: () => {
			zt.success("Technician assigned.");
			queryClient.invalidateQueries();
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Assign technician" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "flex items-end gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-64 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "tech",
				children: "Technician"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				id: "tech",
				value: techId,
				onChange: (e) => setTechId(e.target.value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					disabled: true,
					children: "Select technician..."
				}), techs?.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: t._id,
					children: t.name ?? "Unnamed"
				}, t._id))]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: handleAssign,
			disabled: assign.isPending,
			children: assign.isPending ? "Assigning..." : "Assign"
		})]
	})] });
}
function DiagnosisForm({ jobId }) {
	const queryClient = useQueryClient();
	const diagnose = useDiagnoseMutation();
	const [diagnosis, setDiagnosis] = (0, import_react.useState)("");
	function handleSubmit(e) {
		e.preventDefault();
		if (!diagnosis.trim()) {
			zt.error("Diagnosis cannot be empty.");
			return;
		}
		diagnose.mutate({
			jobId,
			diagnosis: diagnosis.trim()
		}, { onSuccess: () => {
			zt.success("Diagnosis saved.");
			setDiagnosis("");
			queryClient.invalidateQueries();
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Record diagnosis" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "diagnosis",
				children: "What did you find during inspection?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				id: "diagnosis",
				value: diagnosis,
				onChange: (e) => setDiagnosis(e.target.value),
				placeholder: "Describe the issue identified..."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: diagnose.isPending,
				children: diagnose.isPending ? "Saving..." : "Save Diagnosis"
			})
		]
	}) })] });
}
function AddJobItemForm({ jobId }) {
	const queryClient = useQueryClient();
	const { data: parts } = useQuery(partQueries.list());
	const { data: labourTypes } = useQuery(labourTypeQueries.list());
	const addJobItem = useAddJobItemMutation();
	const [itemType, setItemType] = (0, import_react.useState)("part");
	const [partId, setPartId] = (0, import_react.useState)("");
	const [labourTypeId, setLabourTypeId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)(1);
	const selectedPart = parts?.find((p) => p._id === partId);
	const selectedLabour = labourTypes?.find((lt) => lt._id === labourTypeId);
	const unitPrice = itemType === "part" ? selectedPart?.sellingPrice ?? 0 : selectedLabour?.fixedPrice ?? 0;
	function handleSubmit(e) {
		e.preventDefault();
		if (itemType === "part") {
			if (!partId) {
				zt.error("Select a part.");
				return;
			}
			addJobItem.mutate({
				jobId,
				type: "part",
				partId,
				qty,
				unitPrice
			}, { onSuccess: () => {
				zt.success("Part added.");
				setPartId("");
				setQty(1);
				queryClient.invalidateQueries();
			} });
		} else {
			if (!labourTypeId) {
				zt.error("Select a labour type.");
				return;
			}
			addJobItem.mutate({
				jobId,
				type: "labour",
				labourTypeId,
				qty,
				unitPrice
			}, { onSuccess: () => {
				zt.success("Labour added.");
				setLabourTypeId("");
				setQty(1);
				queryClient.invalidateQueries();
			} });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Add parts / labour" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex w-fit rounded-[9px] bg-line-soft p-0.5",
				children: ["part", "labour"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setItemType(t),
					className: cn("rounded-[7px] px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors", itemType === t ? "bg-white text-ink shadow-sm" : "text-mute hover:text-body"),
					children: t
				}, t))
			}),
			itemType === "part" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "part",
					children: "Part"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					id: "part",
					value: partId,
					onChange: (e) => setPartId(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						disabled: true,
						children: "Select part..."
					}), parts?.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: p._id,
						children: [
							p.code,
							" - ",
							p.description,
							" (",
							formatNaira(p.sellingPrice),
							")"
						]
					}, p._id))]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "labour",
					children: "Labour type"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					id: "labour",
					value: labourTypeId,
					onChange: (e) => setLabourTypeId(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						disabled: true,
						children: "Select labour type..."
					}), labourTypes?.map((lt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: lt._id,
						children: [
							lt.name,
							" (",
							formatNaira(lt.fixedPrice),
							")"
						]
					}, lt._id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-24 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "qty",
						children: "Qty"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "qty",
						type: "number",
						min: 1,
						value: qty,
						onChange: (e) => setQty(Number(e.target.value))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-2 text-[13px] text-mute",
					children: ["Unit price: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold text-ink",
						children: formatNaira(unitPrice)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: addJobItem.isPending,
				children: addJobItem.isPending ? "Adding..." : "Add Item"
			})
		]
	}) })] });
}
function JobItemsTable({ jobItems, canRemove }) {
	const queryClient = useQueryClient();
	const removeItem = useRemoveJobItemMutation();
	if (jobItems.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Job items" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Qty" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
				className: "text-right",
				children: "Unit price"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
				className: "text-right",
				children: "Line total"
			}),
			canRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-20" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: jobItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: item.type === "part" ? "info" : "violet",
				children: JOB_ITEM_TYPE_LABELS[item.type]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-body",
				children: item.type === "part" && item.partId ? "Part" : item.type === "labour" && item.labourTypeId ? "Labour" : "-"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "[font-variant-numeric:tabular-nums]",
				children: item.qty
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right [font-variant-numeric:tabular-nums]",
				children: formatNaira(item.unitPrice)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "text-right font-bold text-ink [font-variant-numeric:tabular-nums]",
				children: formatNaira(item.lineTotal)
			}),
			canRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
				onClick: () => removeItem.mutate({ jobItemId: item._id }, { onSuccess: () => {
					zt.success("Item removed.");
					queryClient.invalidateQueries();
				} }),
				children: "Remove"
			}) })
		] }, item._id)) })] })]
	});
}
function CreatePartsRequestForm({ jobId }) {
	const queryClient = useQueryClient();
	const { data: parts } = useQuery(partQueries.list());
	const createRequest = useCreatePartsRequestMutation();
	const [items, setItems] = (0, import_react.useState)([]);
	const [partId, setPartId] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)(1);
	function addItem() {
		if (!partId) {
			zt.error("Select a part.");
			return;
		}
		setItems([...items, {
			partId,
			qty
		}]);
		setPartId("");
		setQty(1);
	}
	function removeItem(idx) {
		setItems(items.filter((_, i) => i !== idx));
	}
	function handleSubmit(e) {
		e.preventDefault();
		if (items.length === 0) {
			zt.error("Add at least one part.");
			return;
		}
		createRequest.mutate({
			jobId,
			items: items.map((item) => ({
				partId: item.partId,
				qty: item.qty
			}))
		}, { onSuccess: () => {
			zt.success("Parts request submitted.");
			setItems([]);
			queryClient.invalidateQueries();
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Request parts from inventory" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-3",
		children: [
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1.5",
				children: items.map((item, idx) => {
					const part = parts?.find((p) => p._id === item.partId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-[9px] bg-line-soft px-3 py-2 text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-body",
							children: [
								part?.code ?? "Unknown",
								" - ",
								part?.description ?? "",
								" ×",
								item.qty
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "text-rose-600 hover:bg-rose-50",
							onClick: () => removeItem(idx),
							children: "Remove"
						})]
					}, idx);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "reqPart",
							children: "Part"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "reqPart",
							value: partId,
							onChange: (e) => setPartId(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								disabled: true,
								children: "Select part..."
							}), parts?.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: p._id,
								children: [
									p.code,
									" - ",
									p.description,
									" (Stock: ",
									p.stockQty,
									")"
								]
							}, p._id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-24 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "reqQty",
							children: "Qty"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "reqQty",
							type: "number",
							min: 1,
							value: qty,
							onChange: (e) => setQty(Number(e.target.value))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: addItem,
						children: "Add to request"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: createRequest.isPending,
				children: createRequest.isPending ? "Submitting..." : "Submit Parts Request"
			})
		]
	}) })] });
}
function PartsRequestsList({ partsRequests }) {
	const queryClient = useQueryClient();
	const { data: me } = useCurrentUser();
	const review = useReviewPartsRequestMutation();
	const dispatch = useDispatchPartsRequestMutation();
	const canReview = me?.role === "inventoryManager" || me?.role === "manager" || me?.role === "admin";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Parts requests" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: partsRequests.map((pr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-[10px] border border-line p-3.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							dot: true,
							variant: PARTS_REQUEST_VARIANTS[pr.status] ?? "secondary",
							children: PARTS_REQUEST_STATUS_LABELS[pr.status]
						}),
						canReview && pr.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => review.mutate({
									partsRequestId: pr._id,
									status: "rejected"
								}, { onSuccess: () => {
									zt.success("Request rejected.");
									queryClient.invalidateQueries();
								} }),
								children: "Reject"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => review.mutate({
									partsRequestId: pr._id,
									status: "approved"
								}, { onSuccess: () => {
									zt.success("Request approved.");
									queryClient.invalidateQueries();
								} }),
								children: "Approve"
							})]
						}),
						canReview && pr.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => dispatch.mutate({ partsRequestId: pr._id }, { onSuccess: () => {
								zt.success("Parts dispatched.");
								queryClient.invalidateQueries();
							} }),
							disabled: dispatch.isPending,
							children: dispatch.isPending ? "Dispatching..." : "Dispatch"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 text-[13px] text-body",
					children: pr.items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mr-3",
						children: [item.qty, "x part"]
					}, idx))
				}),
				pr.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-mute",
					children: ["Note: ", pr.note]
				})
			]
		}, pr._id))
	}) })] });
}
function InvoiceSection({ jobId, invoice, payments, hasItems }) {
	const queryClient = useQueryClient();
	const { data: me } = useCurrentUser();
	const generate = useGenerateInvoiceMutation();
	const approve = useApproveInvoiceMutation();
	const recordPayment = useRecordPaymentMutation();
	const [method, setMethod] = (0, import_react.useState)("cash");
	const canFinance = me?.role === "finance" || me?.role === "manager" || me?.role === "admin";
	if (!invoice) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Invoice" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: !canFinance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-mute",
		children: "Invoice has not been generated yet."
	}) : !hasItems ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[13px] text-mute",
		children: "Add parts or labour before generating an invoice."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		onClick: () => generate.mutate({ jobId }, { onSuccess: () => {
			zt.success("Invoice generated.");
			queryClient.invalidateQueries();
		} }),
		disabled: generate.isPending,
		children: generate.isPending ? "Generating..." : "Generate Invoice"
	}) })] });
	const balance = invoice.grandTotal - invoice.amountPaid;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex-row items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Invoice" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				dot: true,
				variant: invoice.approved ? "success" : "warning",
				children: invoice.approved ? "Approved" : "Pending Approval"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-[10px] border border-line-soft",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Qty" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Unit price"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Total"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: invoice.lineItems.map((li, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-body",
							children: li.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "[font-variant-numeric:tabular-nums]",
							children: li.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right [font-variant-numeric:tabular-nums]",
							children: formatNaira(li.unitPrice)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right font-bold text-ink [font-variant-numeric:tabular-nums]",
							children: formatNaira(li.lineTotal)
						})
					] }, idx)) })] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto w-full max-w-xs space-y-1.5 text-[13px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mute",
								children: "Parts total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(invoice.partsTotal)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mute",
								children: "Labour total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(invoice.labourTotal)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mute",
								children: "Subtotal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(invoice.subtotal)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mute",
								children: "VAT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(invoice.vat)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between border-t border-line pt-1.5 text-sm font-extrabold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Grand total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(invoice.grandTotal)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between font-semibold text-emerald-600",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paid" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(invoice.amountPaid)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between font-bold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Balance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "[font-variant-numeric:tabular-nums]",
								children: formatNaira(balance)
							})]
						})
					]
				}),
				canFinance && !invoice.approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => approve.mutate({ invoiceId: invoice._id }, { onSuccess: () => {
						zt.success("Invoice approved.");
						queryClient.invalidateQueries();
					} }),
					disabled: approve.isPending,
					children: approve.isPending ? "Approving..." : "Approve Invoice"
				}),
				canFinance && invoice.approved && balance > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-3 border-t border-line-soft pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-44 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "method",
							children: "Method"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							id: "method",
							value: method,
							onChange: (e) => setMethod(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "cash",
									children: "Cash"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "transfer",
									children: "Transfer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "card",
									children: "Card"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							const amount = balance;
							recordPayment.mutate({
								invoiceId: invoice._id,
								amount,
								method
							}, { onSuccess: () => {
								zt.success("Payment recorded.");
								queryClient.invalidateQueries();
							} });
						},
						disabled: recordPayment.isPending,
						children: recordPayment.isPending ? "Recording..." : `Record Full Payment (${formatNaira(balance)})`
					})]
				}),
				payments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-line-soft pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-mute",
						children: "Payment history"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1",
						children: payments.map((pmt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-body",
								children: [
									formatDateTime(pmt.ts),
									" · ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize",
										children: pmt.method
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-ink [font-variant-numeric:tabular-nums]",
								children: formatNaira(pmt.amount)
							})]
						}, pmt._id))
					})]
				})
			]
		})]
	});
}
function MarkPaidButton({ jobId }) {
	const queryClient = useQueryClient();
	const markPaid = useMarkPaidMutation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "pt-[18px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => markPaid.mutate({ jobId }, { onSuccess: () => {
				zt.success("Job marked as paid.");
				queryClient.invalidateQueries();
			} }),
			disabled: markPaid.isPending,
			children: markPaid.isPending ? "Updating..." : "Mark Job as Paid"
		})
	}) });
}
//#endregion
export { JobDetailPage as component };
