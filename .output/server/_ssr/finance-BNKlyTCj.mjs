import { __toESM } from "../_runtime.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { labourTypeQueries, settingsQueries, useCreateLabourTypeMutation, useRemoveLabourTypeMutation, useSetVatRateMutation, useUpdateLabourTypeMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { formatNaira } from "./format-Kc-5lS8-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-BNKlyTCj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FinancePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-[23px] font-extrabold tracking-tight text-ink",
			children: "Finance settings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[13px] text-mute",
			children: "Manage labour rates and VAT configuration."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-4 lg:grid-cols-[380px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VatConfigCard, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabourTypesCard, {})]
		})]
	});
}
function VatConfigCard() {
	const queryClient = useQueryClient();
	const { data: settings, isLoading } = useQuery(settingsQueries.get());
	const updateVatRate = useSetVatRateMutation();
	const [vatRate, setVatRate] = (0, import_react.useState)(null);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	const current = vatRate ?? settings?.vatRate ?? 7.5;
	function handleSave() {
		if (current < 0 || current > 100) {
			zt.error("VAT rate must be between 0 and 100.");
			return;
		}
		updateVatRate.mutate({ vatRate: current }, { onSuccess: () => {
			zt.success("VAT rate updated.");
			setVatRate(null);
			queryClient.invalidateQueries();
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "VAT configuration" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-end gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-32 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "vatRate",
				children: "VAT rate (%)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "vatRate",
				type: "number",
				min: 0,
				max: 100,
				step: .5,
				value: current,
				onChange: (e) => setVatRate(Number(e.target.value))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: handleSave,
			disabled: updateVatRate.isPending,
			children: updateVatRate.isPending ? "Saving..." : "Save"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-[12.5px] text-mute",
		children: "This rate is applied when generating invoices."
	})] })] });
}
function LabourTypesCard() {
	const queryClient = useQueryClient();
	const { data: labourTypes, isLoading } = useQuery(labourTypeQueries.list());
	const create = useCreateLabourTypeMutation();
	const update = useUpdateLabourTypeMutation();
	const remove = useRemoveLabourTypeMutation();
	const [name, setName] = (0, import_react.useState)("");
	const [fixedPrice, setFixedPrice] = (0, import_react.useState)("");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editName, setEditName] = (0, import_react.useState)("");
	const [editPrice, setEditPrice] = (0, import_react.useState)("");
	function handleCreate(e) {
		e.preventDefault();
		const price = Math.round(Number(fixedPrice) * 100);
		if (!name.trim()) {
			zt.error("Name is required.");
			return;
		}
		if (!price || price < 0) {
			zt.error("Enter a valid price.");
			return;
		}
		create.mutate({
			name: name.trim(),
			fixedPrice: price
		}, { onSuccess: () => {
			zt.success("Labour type created.");
			setName("");
			setFixedPrice("");
			queryClient.invalidateQueries();
		} });
	}
	function handleUpdate(id) {
		const price = Math.round(Number(editPrice) * 100);
		if (!editName.trim()) {
			zt.error("Name is required.");
			return;
		}
		if (!price || price < 0) {
			zt.error("Enter a valid price.");
			return;
		}
		update.mutate({
			labourTypeId: id,
			name: editName.trim(),
			fixedPrice: price
		}, { onSuccess: () => {
			zt.success("Labour type updated.");
			setEditingId(null);
			queryClient.invalidateQueries();
		} });
	}
	function handleRemove(id) {
		if (!confirm("Delete this labour type?")) return;
		remove.mutate({ labourTypeId: id }, { onSuccess: () => {
			zt.success("Labour type deleted.");
			queryClient.invalidateQueries();
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Labour types" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleCreate,
				className: "flex items-end gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ltName",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ltName",
							placeholder: "e.g. Oil Change",
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-32 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ltPrice",
							children: "Fixed price (₦)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ltPrice",
							type: "number",
							min: 0,
							placeholder: "5000",
							value: fixedPrice,
							onChange: (e) => setFixedPrice(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: create.isPending,
						children: "Add"
					})
				]
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {}) : !labourTypes || labourTypes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-4 text-center text-[13px] text-mute",
				children: "No labour types configured yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-[10px] border border-line-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Fixed price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-40" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: labourTypes.map((lt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: editingId === lt._id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: editName,
						onChange: (e) => setEditName(e.target.value),
						className: "h-8"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: editPrice,
						onChange: (e) => setEditPrice(e.target.value),
						className: "ml-auto h-8 w-32"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => handleUpdate(lt._id),
							children: "Save"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setEditingId(null),
							children: "Cancel"
						})]
					}) })
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-semibold text-ink",
						children: lt.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-bold text-ink [font-variant-numeric:tabular-nums]",
						children: formatNaira(lt.fixedPrice)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => {
								setEditingId(lt._id);
								setEditName(lt.name);
								setEditPrice(String(lt.fixedPrice / 100));
							},
							children: "Edit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
							onClick: () => handleRemove(lt._id),
							children: "Delete"
						})]
					}) })
				] }) }, lt._id)) })] })
			})]
		})]
	});
}
//#endregion
export { FinancePage as component };
