import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconChevronRight } from "./icons-ON1WsQDq.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { leadQueries, useLogFollowUpMutation, useUpdateLeadStageMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Textarea } from "./textarea-CrQHCH19.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Route } from "./lead._id-X8qWdf5g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lead._id-DYvQqkhv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STAGES = [
	"new",
	"contacted",
	"qualified",
	"won",
	"lost"
];
function LeadDetailPage() {
	const { id } = Route.useParams();
	const queryClient = useQueryClient();
	useNavigate();
	const { data: lead, isLoading, isError, error } = useQuery(leadQueries.get(id));
	const updateStage = useUpdateLeadStageMutation();
	const logFollowUp = useLogFollowUpMutation();
	const [followUpNote, setFollowUpNote] = (0, import_react.useState)("");
	const [followUpDate, setFollowUpDate] = (0, import_react.useState)("");
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-rose-600",
			children: ["Error: ", error?.message]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/sales/leads",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to leads"
		})]
	});
	if (!lead) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-mute",
			children: "Lead not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/sales/leads",
			className: "text-[13px] font-semibold text-accent hover:underline",
			children: "← Back to leads"
		})]
	});
	async function handleStageChange(newStage) {
		await updateStage.mutateAsync({
			leadId: id,
			stage: newStage
		}, {
			onSuccess: () => {
				zt.success(`Stage changed to ${newStage}.`);
				queryClient.invalidateQueries();
			},
			onError: (err) => zt.error(err.message)
		});
	}
	async function handleFollowUp(e) {
		e.preventDefault();
		if (!followUpNote.trim()) {
			zt.error("Note is required.");
			return;
		}
		const nextFollowUpTs = followUpDate ? new Date(followUpDate).getTime() : void 0;
		await logFollowUp.mutateAsync({
			leadId: id,
			note: followUpNote.trim(),
			nextFollowUpTs
		}, {
			onSuccess: () => {
				zt.success("Follow-up logged.");
				setFollowUpNote("");
				setFollowUpDate("");
				queryClient.invalidateQueries();
			},
			onError: (err) => zt.error(err.message)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: lead.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: [lead.phone, lead.email ? ` \u2022 ${lead.email}` : ""]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/sales/leads",
					className: "flex items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, {
						size: 13,
						className: "rotate-180"
					}), " Back to leads"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Stage" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => handleStageChange(s),
					disabled: lead.stage === s || updateStage.isPending,
					className: `rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${lead.stage === s ? "bg-accent text-white" : "bg-line-soft text-body hover:bg-line"}`,
					children: s.charAt(0).toUpperCase() + s.slice(1)
				}, s))
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Follow-up Notes" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleFollowUp,
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "note",
							children: "Add note"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "note",
							value: followUpNote,
							onChange: (e) => setFollowUpNote(e.target.value),
							rows: 2,
							required: true
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "followUpDate",
								children: "Next follow-up date"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "followUpDate",
								type: "date",
								value: followUpDate,
								onChange: (e) => setFollowUpDate(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: logFollowUp.isPending,
							children: logFollowUp.isPending ? "Saving..." : "Log note"
						})]
					})]
				}), lead.notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-mute",
					children: "No follow-ups logged yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: [...lead.notes].reverse().map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-line-soft p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[13px] text-body",
							children: n.text
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-mute",
							children: new Date(n.ts).toLocaleString("en-NG")
						})]
					}, i))
				})]
			})] }),
			lead.nextFollowUpTs && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Next Follow-up" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] text-body",
				children: new Date(lead.nextFollowUpTs).toLocaleDateString("en-NG", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric"
				})
			}) })] })
		]
	});
}
//#endregion
export { LeadDetailPage as component };
