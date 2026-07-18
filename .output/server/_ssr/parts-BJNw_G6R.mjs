import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime, require_react } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { IconPlus, IconSearch, IconUpload } from "./icons-ON1WsQDq.mjs";
import { Card, CardContent, CardHeader, CardTitle } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { partQueries, useAdjustStockMutation, useCreatePartMutation, useImportPartsMutation, useUpdatePartMutation } from "./queries-DshR6pBd.mjs";
import { Input, Label } from "./label-Dfjt7mD7.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { useCurrentUser } from "./auth-BJb3cJTg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parts-BJNw_G6R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyForm = {
	code: "",
	description: "",
	costPrice: "",
	sellingPrice: "",
	stockQty: "0",
	reorderLevel: "0"
};
function PartsPage() {
	const { data: user } = useCurrentUser();
	const canEdit = user?.role === "inventoryManager" || user?.role === "manager" || user?.role === "admin";
	const [q, setQ] = (0, import_react.useState)("");
	const { data: parts, isLoading } = useQuery(partQueries.search(q));
	const [showAdd, setShowAdd] = (0, import_react.useState)(false);
	const [editId, setEditId] = (0, import_react.useState)(null);
	const [adjustId, setAdjustId] = (0, import_react.useState)(null);
	const [showImport, setShowImport] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-[23px] font-extrabold tracking-tight text-ink",
					children: "Parts Catalogue"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-[13px] text-mute",
					children: parts ? `${parts.length} parts` : "Spare parts inventory management."
				})] }), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setShowImport(true),
						variant: "outline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconUpload, { size: 15 }), " Import CSV"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setShowAdd(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPlus, { size: 15 }), " Add part"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconSearch, {
					size: 15,
					className: "absolute left-3 top-1/2 -translate-y-1/2 text-mute"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search by code or description...",
					value: q,
					onChange: (e) => setQ(e.target.value),
					className: "pl-9"
				})]
			}),
			showAdd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartForm, { onDone: () => setShowAdd(false) }),
			editId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartForm, {
				partId: editId,
				onDone: () => setEditId(null)
			}),
			showImport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvImport, { onDone: () => setShowImport(false) }),
			adjustId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockAdjustForm, {
				partId: adjustId,
				onDone: () => setAdjustId(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Code" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Cost Price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Selling Price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Reorder"
					}),
					canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "w-24 text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: canEdit ? 7 : 6,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {})
				}) }) : !parts || parts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: canEdit ? 7 : 6,
					className: "py-10 text-center text-mute",
					children: q ? "No parts match your search." : "No parts in the catalogue yet."
				}) }) : parts.map((p) => {
					const lowStock = p.stockQty <= p.reorderLevel;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "whitespace-nowrap font-semibold text-ink",
							children: p.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-[300px] truncate text-body",
							children: p.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right text-body",
							children: ["₦", (p.costPrice / 100).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right text-body",
							children: ["₦", (p.sellingPrice / 100).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-semibold", lowStock ? "text-rose-600" : "text-ink"),
								children: p.stockQty
							}), lowStock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1.5 inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700",
								children: "LOW"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right text-mute",
							children: p.reorderLevel
						}),
						canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setEditId(p._id),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setAdjustId(p._id),
									children: "Stock"
								})]
							})
						})
					] }, p._id);
				}) })] })
			})
		]
	});
}
function PartForm({ partId, onDone }) {
	const queryClient = useQueryClient();
	const createPart = useCreatePartMutation();
	const updatePart = useUpdatePartMutation();
	const { data: existing } = useQuery({
		...partQueries.list(),
		enabled: !!partId,
		select: (all) => all.find((p) => p._id === partId)
	});
	const [form, setForm] = (0, import_react.useState)(() => {
		if (existing) return {
			code: existing.code,
			description: existing.description,
			costPrice: String(existing.costPrice),
			sellingPrice: String(existing.sellingPrice),
			stockQty: String(existing.stockQty),
			reorderLevel: String(existing.reorderLevel)
		};
		return emptyForm;
	});
	const handleChange = (field) => (e) => {
		setForm((prev) => ({
			...prev,
			[field]: e.target.value
		}));
	};
	async function handleSubmit(e) {
		e.preventDefault();
		if (!form.code.trim() || !form.description.trim()) {
			zt.error("Code and description are required.");
			return;
		}
		const data = {
			code: form.code.trim(),
			description: form.description.trim(),
			costPrice: Math.round(Number(form.costPrice) * 100) || 0,
			sellingPrice: Math.round(Number(form.sellingPrice) * 100) || 0,
			stockQty: Math.max(0, Math.round(Number(form.stockQty) || 0)),
			reorderLevel: Math.max(0, Math.round(Number(form.reorderLevel) || 0))
		};
		try {
			if (partId) {
				await updatePart.mutateAsync({
					partId,
					...data
				});
				zt.success("Part updated.");
			} else {
				await createPart.mutateAsync(data);
				zt.success("Part created.");
			}
			queryClient.invalidateQueries();
			onDone();
		} catch (err) {
			zt.error(err instanceof Error ? err.message : "Failed to save part.");
		}
	}
	const saving = createPart.isPending || updatePart.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: partId ? "Edit part" : "Add part" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "grid gap-4 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "code",
					children: "Code *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "code",
					value: form.code,
					onChange: handleChange("code"),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "description",
					children: "Description *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "description",
					value: form.description,
					onChange: handleChange("description"),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "costPrice",
					children: "Cost Price (Naira)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "costPrice",
					type: "number",
					min: 0,
					value: form.costPrice,
					onChange: handleChange("costPrice")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "sellingPrice",
					children: "Selling Price (Naira)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "sellingPrice",
					type: "number",
					min: 0,
					value: form.sellingPrice,
					onChange: handleChange("sellingPrice")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "stockQty",
					children: "Stock Qty"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "stockQty",
					type: "number",
					min: 0,
					value: form.stockQty,
					onChange: handleChange("stockQty")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "reorderLevel",
					children: "Reorder Level"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "reorderLevel",
					type: "number",
					min: 0,
					value: form.reorderLevel,
					onChange: handleChange("reorderLevel")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: saving,
					children: saving ? "Saving..." : partId ? "Update part" : "Add part"
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
function StockAdjustForm({ partId, onDone }) {
	const queryClient = useQueryClient();
	const adjust = useAdjustStockMutation();
	const { data: part } = useQuery(partQueries.search(""));
	const p = part?.find((x) => x._id === partId);
	const [type, setType] = (0, import_react.useState)("in");
	const [qty, setQty] = (0, import_react.useState)("");
	async function handleSubmit(e) {
		e.preventDefault();
		const q = Number(qty);
		if (!q || q <= 0) {
			zt.error("Enter a valid quantity.");
			return;
		}
		try {
			await adjust.mutateAsync({
				partId,
				qty: type === "out" ? q : type === "adjust" ? q : q,
				type
			});
			zt.success("Stock adjusted.");
			queryClient.invalidateQueries();
			onDone();
		} catch (err) {
			zt.error(err instanceof Error ? err.message : "Failed to adjust stock.");
		}
	}
	if (!p) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: ["Adjust Stock: ", p.code] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mb-3 text-[13px] text-mute",
		children: ["Current stock: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold text-ink",
			children: p.stockQty
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: [
					"in",
					"out",
					"adjust"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setType(t),
					className: `rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${type === t ? "bg-accent text-white" : "bg-line-soft text-body hover:bg-line"}`,
					children: t === "in" ? "Stock In" : t === "out" ? "Stock Out" : "Set Exact"
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "adjQty",
					children: type === "adjust" ? "New stock qty" : "Quantity to " + (type === "in" ? "add" : "remove")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "adjQty",
					type: "number",
					min: 1,
					value: qty,
					onChange: (e) => setQty(e.target.value),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: adjust.isPending,
					children: adjust.isPending ? "Adjusting..." : "Confirm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: onDone,
					children: "Cancel"
				})]
			})
		]
	})] })] });
}
function CsvImport({ onDone }) {
	const queryClient = useQueryClient();
	const importParts = useImportPartsMutation();
	const fileRef = (0, import_react.useRef)(null);
	async function handleFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const lines = (await file.text()).trim().split("\n");
		if (lines.length < 2) {
			zt.error("CSV must have a header row and at least one data row.");
			return;
		}
		const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
		const codeIdx = headers.indexOf("code");
		const descIdx = headers.indexOf("description");
		const costIdx = headers.findIndex((h) => h.includes("cost"));
		const sellIdx = headers.findIndex((h) => h.includes("selling") || h.includes("price"));
		const stockIdx = headers.indexOf("stock");
		const reorderIdx = headers.indexOf("reorder");
		if (codeIdx === -1 || descIdx === -1) {
			zt.error("CSV must have at least \"code\" and \"description\" columns.");
			return;
		}
		const parts = [];
		for (let i = 1; i < lines.length; i++) {
			const cols = lines[i].split(",").map((c) => c.trim());
			const code = cols[codeIdx];
			const description = cols[descIdx];
			if (!code || !description) continue;
			parts.push({
				code,
				description,
				costPrice: Math.round(Number(cols[costIdx] ?? 0) * 100),
				sellingPrice: Math.round(Number(cols[sellIdx] ?? 0) * 100),
				stockQty: Math.max(0, Math.round(Number(cols[stockIdx] ?? 0))),
				reorderLevel: Math.max(0, Math.round(Number(cols[reorderIdx] ?? 0)))
			});
		}
		if (parts.length === 0) {
			zt.error("No valid parts found in CSV.");
			return;
		}
		try {
			const result = await importParts.mutateAsync({ parts });
			zt.success(`Imported ${result.count} parts.`);
			queryClient.invalidateQueries();
			onDone();
		} catch (err) {
			zt.error(err instanceof Error ? err.message : "Import failed.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Import parts from CSV" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[13px] text-mute",
				children: ["CSV must have headers: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "code, description, cost, selling, stock, reorder" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: ".csv",
				onChange: handleFile,
				className: "block w-full text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-white",
				disabled: importParts.isPending
			}),
			importParts.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] text-mute",
				children: "Importing..."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onDone,
				children: "Close"
			})
		]
	})] });
}
//#endregion
export { PartsPage as component };
