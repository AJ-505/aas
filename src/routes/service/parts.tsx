import { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCurrentUser } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Loader } from "~/components/Loader";
import { IconPlus, IconSearch, IconUpload } from "~/components/icons";
import {
  partQueries,
  vehicleBrandQueries,
  useCreatePartMutation,
  useUpdatePartMutation,
  useAdjustStockMutation,
  useImportPartsMutation,
  useCreateBrandMutation,
  useRemoveBrandMutation,
} from "~/lib/queries";
import { cn } from "~/lib/utils";
import {
  LUBRICANT_SUBCATEGORIES,
  PART_CATEGORY_DEFAULTS,
  PART_CATEGORY_GROUPS,
  VEHICLE_BRAND_DEFAULTS,
  normalizePartCategory,
} from "~/lib/catalogue-defaults";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/service/parts")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: PartsPage,
});

const CATEGORY_OPTIONS = [...PART_CATEGORY_DEFAULTS];
const CATEGORY_GROUPS = PART_CATEGORY_GROUPS;
const OTHER_CATEGORY_OPTIONS = CATEGORY_OPTIONS.filter(
  (category) =>
    !CATEGORY_GROUPS.flatMap((group) => group.options).includes(category),
);

interface PartForm {
  partNumber: string;
  description: string;
  costPrice: string;
  sellingPrice: string;
  stockQty: string;
  reorderLevel: string;
  brand: string;
  category: string;
}

const emptyForm: PartForm = {
  partNumber: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  stockQty: "0",
  reorderLevel: "0",
  brand: VEHICLE_BRAND_DEFAULTS[0],
  category: PART_CATEGORY_DEFAULTS[0],
};

function BrandSelectInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}) {
  const { data: brands } = useQuery(vehicleBrandQueries.list());
  const brandSuggestions = useMemo(() => {
    const set = new Set<string>(VEHICLE_BRAND_DEFAULTS);
    for (const b of brands ?? []) set.add(b.name);
    return Array.from(set);
  }, [brands]);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink"
      aria-label={placeholder ?? "Brand"}
    >
      {brandSuggestions.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

function PartsPage() {
  const searchParams = Route.useSearch();
  const { data: user } = useCurrentUser();

  if (
    user?.role &&
    user.role !== "audit" &&
    !["inventoryManager", "manager", "admin"].includes(user.role)
  ) {
    return <Navigate to="/" />;
  }

  const canEdit =
    user?.role === "inventoryManager" ||
    user?.role === "manager" ||
    user?.role === "admin";
  const canManageBrands = user?.role === "manager" || user?.role === "admin";

  const [q, setQ] = useState(searchParams.q || "");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { data: parts, isLoading } = useQuery(
    partQueries.search(q, brandFilter, categoryFilter),
  );
  const { data: allBrands } = useQuery(vehicleBrandQueries.list());
  const { data: categories } = useQuery(partQueries.categories());

  // Merge static categories + db categories for filter dropdown completeness
  const categoryOptions = useMemo(() => {
    const set = new Set<string>(CATEGORY_OPTIONS);
    for (const c of categories ?? []) set.add(normalizePartCategory(c) ?? c);
    const combined = Array.from(set);
    return combined.sort((a, b) => {
      if (a === "Lubricants") return -1;
      if (b === "Lubricants") return 1;
      return a.localeCompare(b);
    });
  }, [categories]);

  const brandOptions = useMemo(() => {
    const fromParts = new Set<string>(VEHICLE_BRAND_DEFAULTS);
    // also include vehicleBrands
    for (const b of allBrands ?? []) fromParts.add(b.name);
    return Array.from(fromParts).sort();
  }, [allBrands]);

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q);
    }
  }, [searchParams.q]);

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showBrands, setShowBrands] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            Parts Catalogue
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {parts
              ? `${parts.length} parts`
              : "Spare parts inventory management."}{" "}
            Storage field remains{" "}
            <span className="mono text-[11px] bg-line-soft px-1 py-0.5 rounded">
              code
            </span>{" "}
            (label: Part Number).
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {canManageBrands && (
              <Button
                variant="outline"
                onClick={() => setShowBrands((v) => !v)}
              >
                {showBrands ? "Hide brands" : "Manage brands"}
              </Button>
            )}
            <Button onClick={() => setShowImport(true)} variant="outline">
              <IconUpload size={15} /> Import CSV
            </Button>
            <Button onClick={() => setShowAdd(true)}>
              <IconPlus size={15} /> Add part
            </Button>
          </div>
        )}
      </div>

      {showBrands && canManageBrands && (
        <BrandManager onClose={() => setShowBrands(false)} />
      )}

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
            />
            <Input
              placeholder="Search by part number or description..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink"
              aria-label="Filter by brand"
            >
              <option value="">All brands</option>
              {brandOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </optgroup>
              ))}
              {OTHER_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(brandFilter || categoryFilter) && (
          <div className="mt-2 flex gap-2 text-xs text-mute">
            <span>Active filters:</span>
            {brandFilter && (
              <span className="rounded bg-line-soft px-1.5 py-0.5 font-semibold text-ink">
                brand: {brandFilter}
              </span>
            )}
            {categoryFilter && (
              <span className="rounded bg-line-soft px-1.5 py-0.5 font-semibold text-ink">
                category: {categoryFilter}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setBrandFilter("");
                setCategoryFilter("");
              }}
              className="underline"
            >
              Clear
            </button>
          </div>
        )}
      </Card>

      {showAdd && <PartForm onDone={() => setShowAdd(false)} />}
      {editId && <PartForm partId={editId} onDone={() => setEditId(null)} />}
      {showImport && <CsvImport onDone={() => setShowImport(false)} />}
      {adjustId && (
        <StockAdjustForm partId={adjustId} onDone={() => setAdjustId(null)} />
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              {canEdit && (
                <TableHead className="w-24 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 9 : 8}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !parts || parts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 9 : 8}
                  className="py-10 text-center text-mute"
                >
                  {q || brandFilter || categoryFilter
                    ? "No parts match your filters."
                    : "No parts in the catalogue yet."}
                </TableCell>
              </TableRow>
            ) : (
              parts.map((p) => {
                const lowStock = p.stockQty <= p.reorderLevel;
                return (
                  <TableRow key={p._id}>
                    <TableCell className="whitespace-nowrap font-semibold text-ink">
                      {p.code}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-body">
                      {p.description}
                    </TableCell>
                    <TableCell className="text-body">
                      {(p as any).brand ?? "Generic"}
                    </TableCell>
                    <TableCell className="text-mute text-xs">
                      {(p as any).category ?? "Uncategorized"}
                    </TableCell>
                    <TableCell className="text-right text-body">
                      &#8358;{(p.costPrice / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-body">
                      &#8358;{(p.sellingPrice / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-semibold",
                          lowStock ? "text-rose-600" : "text-ink",
                        )}
                      >
                        {p.stockQty}
                      </span>
                      {lowStock && (
                        <span className="ml-1.5 inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          LOW
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-mute">
                      {p.reorderLevel}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditId(p._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAdjustId(p._id)}
                          >
                            Stock
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function BrandManager({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: brands } = useQuery(vehicleBrandQueries.list());
  const createBrand = useCreateBrandMutation();
  const removeBrand = useRemoveBrandMutation();
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name required");
      return;
    }
    try {
      await createBrand.mutateAsync({ name: name.trim() });
      toast.success("Brand added");
      setName("");
      void queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add brand");
    }
  }
  async function handleRemove(id: string) {
    if (
      !confirm(
        "Delete this brand? Existing parts/vehicles keep their brand string.",
      )
    )
      return;
    try {
      await removeBrand.mutateAsync({ brandId: id as Id<"vehicleBrands"> });
      toast.success("Brand removed");
      void queryClient.invalidateQueries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vehicle Brands</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-mute">
          Manage brand list used for suggestions in Parts and Vehicle Inventory.
          Free-text is always allowed — this list only powers the dropdown
          suggestions.
        </p>
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder="New brand e.g. Toyota"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" disabled={createBrand.isPending}>
            {createBrand.isPending ? "Adding..." : "Add brand"}
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {(brands ?? []).length === 0 ? (
            <span className="text-xs text-mute">No brands yet.</span>
          ) : (
            (brands ?? []).map((b: any) => (
              <span
                key={b._id}
                className="inline-flex items-center gap-1 rounded-full bg-line-soft px-2.5 py-1 text-xs font-semibold text-ink"
              >
                {b.name}
                <button
                  type="button"
                  onClick={() => handleRemove(b._id)}
                  className="ml-1 text-mute hover:text-rose-600"
                  aria-label={`Remove ${b.name}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PartForm({ partId, onDone }: { partId?: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const createPart = useCreatePartMutation();
  const updatePart = useUpdatePartMutation();
  const { data: existing } = useQuery({
    ...partQueries.list(),
    enabled: !!partId,
    select: (all) => all.find((p) => p._id === partId),
  });

  const [form, setForm] = useState<PartForm>(emptyForm);
  useEffect(() => {
    if (existing) {
      setForm({
        partNumber: existing.code,
        description: existing.description,
        costPrice: String(existing.costPrice),
        sellingPrice: String(existing.sellingPrice),
        stockQty: String(existing.stockQty),
        reorderLevel: String(existing.reorderLevel),
        brand: (existing as any).brand ?? VEHICLE_BRAND_DEFAULTS[0],
        category: (existing as any).category ?? PART_CATEGORY_DEFAULTS[0],
      });
    } else {
      setForm({
        ...emptyForm,
        brand: VEHICLE_BRAND_DEFAULTS[0],
        category: PART_CATEGORY_DEFAULTS[0],
      });
    }
  }, [existing]);

  const handleChange =
    (field: keyof PartForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.partNumber.trim() || !form.description.trim()) {
      toast.error("Part Number and description are required.");
      return;
    }
    const data = {
      code: form.partNumber.trim(),
      description: form.description.trim(),
      costPrice: Math.round(Number(form.costPrice) * 100) || 0,
      sellingPrice: Math.round(Number(form.sellingPrice) * 100) || 0,
      stockQty: Math.max(0, Math.round(Number(form.stockQty) || 0)),
      reorderLevel: Math.max(0, Math.round(Number(form.reorderLevel) || 0)),
      brand: form.brand.trim() || undefined,
      category: form.category.trim() || undefined,
    };

    try {
      if (partId) {
        await updatePart.mutateAsync({
          partId: partId as Id<"parts">,
          ...data,
        });
        toast.success("Part updated.");
      } else {
        await createPart.mutateAsync(data);
        toast.success("Part created.");
      }
      void queryClient.invalidateQueries();
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save part.");
    }
  }

  const saving = createPart.isPending || updatePart.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{partId ? "Edit part" : "Add part"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number *</Label>
            <Input
              id="partNumber"
              value={form.partNumber}
              onChange={handleChange("partNumber")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={form.description}
              onChange={handleChange("description")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <BrandSelectInput
              id="brand"
              value={form.brand}
              onChange={(v) => setForm((p) => ({ ...p, brand: v }))}
              placeholder="Brand"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={handleChange("category")}
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm"
            >
              {CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </optgroup>
              ))}
              {OTHER_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (Naira)</Label>
            <Input
              id="costPrice"
              type="number"
              min={0}
              value={form.costPrice}
              onChange={handleChange("costPrice")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price (Naira)</Label>
            <Input
              id="sellingPrice"
              type="number"
              min={0}
              value={form.sellingPrice}
              onChange={handleChange("sellingPrice")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQty">Stock Qty</Label>
            <Input
              id="stockQty"
              type="number"
              min={0}
              value={form.stockQty}
              onChange={handleChange("stockQty")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorderLevel">Reorder Level</Label>
            <Input
              id="reorderLevel"
              type="number"
              min={0}
              value={form.reorderLevel}
              onChange={handleChange("reorderLevel")}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : partId ? "Update part" : "Add part"}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StockAdjustForm({
  partId,
  onDone,
}: {
  partId: string;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const adjust = useAdjustStockMutation();
  const { data: part } = useQuery(partQueries.search("", "", ""));
  const p = part?.find((x) => x._id === partId);

  const [type, setType] = useState<"in" | "out" | "adjust">("in");
  const [qty, setQty] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(qty);
    if (!q || q <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }
    try {
      await adjust.mutateAsync({
        partId: partId as Id<"parts">,
        qty: q,
        type,
      });
      toast.success("Stock adjusted.");
      void queryClient.invalidateQueries();
      onDone();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to adjust stock.",
      );
    }
  }

  if (!p) return <Loader />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjust Stock: {p.code}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-[13px] text-mute">
          Current stock:{" "}
          <span className="font-semibold text-ink">{p.stockQty}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(["in", "out", "adjust"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
                  type === t
                    ? "bg-accent text-white"
                    : "bg-line-soft text-body hover:bg-line"
                }`}
              >
                {t === "in"
                  ? "Stock In"
                  : t === "out"
                    ? "Stock Out"
                    : "Set Exact"}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjQty">
              {type === "adjust"
                ? "New stock qty"
                : "Quantity to " + (type === "in" ? "add" : "remove")}
            </Label>
            <Input
              id="adjQty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={adjust.isPending}>
              {adjust.isPending ? "Adjusting..." : "Confirm"}
            </Button>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CsvImport({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const importParts = useImportPartsMutation();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row.");
      return;
    }

    const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
    // Support both legacy 'code' and new 'part number' headers
    let codeIdx = headers.indexOf("code");
    if (codeIdx === -1)
      codeIdx = headers.findIndex(
        (h) => h.includes("part") && h.includes("number"),
      );
    if (codeIdx === -1) codeIdx = headers.indexOf("part_number");
    const descIdx = headers.indexOf("description");
    const costIdx = headers.findIndex((h) => h.includes("cost"));
    const sellIdx = headers.findIndex(
      (h) =>
        h.includes("selling") || (h.includes("price") && !h.includes("cost")),
    );
    const stockIdx = headers.indexOf("stock");
    const reorderIdx = headers.indexOf("reorder");
    const brandIdx = headers.indexOf("brand");
    const categoryIdx = headers.indexOf("category");

    if (codeIdx === -1 || descIdx === -1) {
      toast.error(
        'CSV must have at least "part number" (or "code") and "description" columns.',
      );
      return;
    }

    const parts: Array<{
      code: string;
      description: string;
      costPrice: number;
      sellingPrice: number;
      stockQty: number;
      reorderLevel: number;
      brand?: string;
      category?: string;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]!.split(",").map((c) => c.trim());
      const code = cols[codeIdx];
      const description = cols[descIdx];
      if (!code || !description) continue;

      parts.push({
        code,
        description,
        costPrice: Math.round(Number(cols[costIdx] ?? 0) * 100),
        sellingPrice: Math.round(Number(cols[sellIdx] ?? 0) * 100),
        stockQty: Math.max(0, Math.round(Number(cols[stockIdx] ?? 0))),
        reorderLevel: Math.max(0, Math.round(Number(cols[reorderIdx] ?? 0))),
        brand: brandIdx !== -1 ? cols[brandIdx] || undefined : undefined,
        category:
          categoryIdx !== -1 ? cols[categoryIdx] || undefined : undefined,
      });
    }

    if (parts.length === 0) {
      toast.error("No valid parts found in CSV.");
      return;
    }

    try {
      const result = await importParts.mutateAsync({ parts });
      toast.success(`Imported ${result.count} parts.`);
      void queryClient.invalidateQueries();
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import parts from CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[13px] text-mute">
          CSV headers:{" "}
          <strong>
            part number, description, cost, selling, stock, reorder
          </strong>{" "}
          — optional: <strong>brand, category</strong>. Legacy{" "}
          <strong>code</strong> header still accepted.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-white"
          disabled={importParts.isPending}
        />
        {importParts.isPending && (
          <p className="text-[13px] text-mute">Importing...</p>
        )}
        <Button variant="outline" onClick={onDone}>
          Close
        </Button>
      </CardContent>
    </Card>
  );
}
