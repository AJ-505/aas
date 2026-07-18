import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconChevronRight, IconPlus, IconSearch } from "./icons-ON1WsQDq.mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { leadQueries, useCreateLeadMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads-1BdMBR8n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LEAD_STAGE_VARIANTS = {
	new: "info",
	contacted: "warning",
	qualified: "violet",
	won: "success",
	lost: "destructive"
};
var LEAD_STAGE_LABELS = {
	new: "New",
	contacted: "Contacted",
	qualified: "Qualified",
	won: "Won",
	lost: "Lost"
};
function LeadsPage() {
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [showCreate, setShowCreate] = (0, import_react.useState)(false);
	const { data: leads, isLoading } = useQuery(leadQueries.search(q));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: "Leads"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: leads ? `${leads.length} leads` : "Track customer enquiries and test drives."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setShowCreate((s) => !s),
					children: showCreate ? "Close" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPlus, { size: 15 }), " Add lead"] })
				})]
			}),
			showCreate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateLeadForm, { onDone: () => setShowCreate(false) }),
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stage" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Follow-up" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
				}) }) : !leads || leads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					colSpan: 5,
					className: "py-10 text-center text-mute",
					children: [
						"No leads found",
						q ? ` for "${q}"` : "",
						"."
					]
				}) }) : leads.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer",
					onClick: () => navigate({
						to: "/sales/lead/$id",
						params: { id: l._id }
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap font-semibold text-ink",
							children: l.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap text-mute",
							children: l.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							dot: true,
							variant: LEAD_STAGE_VARIANTS[l.stage] ?? "secondary",
							children: LEAD_STAGE_LABELS[l.stage]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-[13px] text-mute",
							children: l.nextFollowUpTs ? new Date(l.nextFollowUpTs).toLocaleDateString("en-NG") : "-"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "px-2 text-mute",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 15 })
						})
					]
				}, l._id)) })] })
			})
		]
	});
}
function CreateLeadForm({ onDone }) {
	const queryClient = useQueryClient();
	const create = useCreateLeadMutation();
	async function handleSubmit(e) {
		e.preventDefault();
		const f = new FormData(e.currentTarget);
		const name = f.get("name").trim();
		const phone = f.get("phone").trim();
		if (!name || !phone) {
			zt.error("Name and phone are required.");
			return;
		}
		await create.mutateAsync({
			name,
			phone,
			email: f.get("email").trim() || void 0,
			nextFollowUpTs: void 0
		}, {
			onSuccess: () => {
				zt.success("Lead created.");
				queryClient.invalidateQueries();
				onDone();
			},
			onError: (err) => zt.error(err.message)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "New lead" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: create.isPending,
					children: create.isPending ? "Saving..." : "Create lead"
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
export { LeadsPage as component };
