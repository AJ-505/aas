import { useState, useEffect } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FieldError, zodToFormikValidate } from "~/lib/formik-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useCurrentUser } from "~/lib/auth";
import { Navigate } from "@tanstack/react-router";
import {
  customerQueries,
  useCreateCustomerMutation,
  useCreateVehicleMutation,
  useCheckInMutation,
} from "~/lib/queries";
import { Loader } from "~/components/Loader";
import { Avatar } from "~/components/Avatar";
import { IconChevronRight, IconPlus, IconSearch } from "~/components/icons";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/service/customers")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const searchParams = Route.useSearch();
  const [q, setQ] = useState(searchParams.q || "");
  const [showCreate, setShowCreate] = useState(false);
  const { data: user } = useCurrentUser();
  const { data: customers, isLoading } = useQuery(customerQueries.search(q));
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.q !== undefined) {
      setQ(searchParams.q);
    }
  }, [searchParams.q]);

  if (user && user.role === "salesRep") {
    return <Navigate to="/" />;
  }

  const canAdd = ["csr", "manager", "admin"].includes(user?.role ?? "");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            Customers
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {customers
              ? `${customers.length} registered`
              : "Directory of customers and their vehicles."}
          </p>
        </div>
        {canAdd && (
          <Button
            onClick={() => setShowCreate((s) => !s)}
            variant={showCreate ? "outline" : "default"}
          >
            {showCreate ? (
              "Close"
            ) : (
              <>
                <IconPlus size={15} /> Add customer
              </>
            )}
          </Button>
        )}
      </div>

      {showCreate && <CreateCustomerForm onDone={() => setShowCreate(false)} />}

      <div className="relative max-w-sm">
        <IconSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
        />
        <Input
          placeholder="Search by name or phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !customers || customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-mute">
                  No customers found{q ? ` for “${q}”` : ""}.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow
                  key={c._id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/service/customer/$id",
                      params: { id: c._id },
                    })
                  }
                >
                  <TableCell className="whitespace-nowrap">
                    <span className="flex items-center gap-2.5 font-semibold text-ink">
                      <Avatar name={c.name} size={28} />
                      {c.name}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-body">
                    {c.phone}
                  </TableCell>
                  <TableCell className="hidden text-mute md:table-cell">
                    {c.email ?? "-"}
                  </TableCell>
                  <TableCell className="px-2 text-mute">
                    <IconChevronRight size={15} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function CreateCustomerForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomerMutation();
  const createVehicle = useCreateVehicleMutation();
  const checkIn = useCheckInMutation();
  const navigate = useNavigate();

  const [gateQ, setGateQ] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    id: string;
    name: string;
    phone: string;
  } | null>(null);

  const { data: gateResults } = useQuery({
    ...customerQueries.search(gateQ.trim()),
    enabled: hasSearched && gateQ.trim().length > 0,
  });

  function handleGateSearch() {
    if (!gateQ.trim()) {
      toast.error("Enter name or phone to search first.");
      return;
    }
    setHasSearched(true);
  }

  const customerFormSchema = z
    .object({
      name: z.string().trim().min(1, "Name is required"),
      phone: z
        .string()
        .trim()
        .min(1, "Phone is required")
        .regex(/^[\d\s+\-()]+$/, "Phone must contain only numbers, spaces, +, -, ( )")
        .refine((v) => {
          const digits = v.replace(/\D/g, "");
          return digits.length >= 7 && digits.length <= 15;
        }, { message: "Phone must be 7-15 digits" }),
      email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
      address: z.string().trim().optional().or(z.literal("")),
      make: z.string().trim().optional().or(z.literal("")),
      model: z.string().trim().optional().or(z.literal("")),
      year: z.string().trim().optional().or(z.literal("")),
      color: z.string().trim().optional().or(z.literal("")),
      plate: z
        .string()
        .trim()
        .optional()
        .or(z.literal(""))
        .refine((val) => {
          if (!val) return true;
          return /^[A-Z0-9][A-Z0-9 -]{2,}$/.test(val.trim().toUpperCase());
        }, { message: "Plate must be 3+ chars, uppercase alphanumerics, spaces or hyphens" }),
      vin: z.string().trim().optional().or(z.literal("")),
      complaint: z.string().trim().optional().or(z.literal("")),
    })
    .superRefine((v, ctx) => {
      const hasAnyVehicle = !!(v.make || v.model || v.year || v.color);
      const hasAllVehicle = !!(v.make && v.model && v.year && v.color);
      if (hasAnyVehicle && !hasAllVehicle) {
        ctx.addIssue({
          code: "custom",
          path: ["make"],
          message: "Fill all vehicle fields (make, model, year, colour) or leave all empty.",
        });
      }
      if (v.year) {
        const n = Number(v.year);
        if (Number.isNaN(n) || n < 1900 || n > new Date().getFullYear() + 1) {
          ctx.addIssue({ code: "custom", path: ["year"], message: "Year must be 1900 to next year" });
        }
      }
    });

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      make: "",
      model: "",
      year: "",
      color: "",
      plate: "",
      vin: "",
      complaint: "",
    },
    validate: zodToFormikValidate(customerFormSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      if (!hasSearched) {
        toast.error("Please search for existing customers first.");
        setSubmitting(false);
        return;
      }
      const name = values.name.trim();
      const phone = values.phone.trim();
      const email = values.email.trim();
      const address = values.address.trim();
      const make = values.make.trim();
      const model = values.model.trim();
      const yearStr = values.year.trim();
      const color = values.color.trim();
      const plate = values.plate.trim();
      const vin = values.vin.trim();
      const complaint = values.complaint.trim();
      const hasVehicle = !!(make && model && yearStr && color);
      try {
        const customerId = await createCustomer.mutateAsync({
          name,
          phone,
          email: email || undefined,
          address: address || undefined,
        });
        let vehicleId: string | null = null;
        if (hasVehicle) {
          vehicleId = await createVehicle.mutateAsync({
            ownerId: customerId as Id<"customers">,
            make,
            model,
            year: Number(yearStr),
            color,
            plate: plate || undefined,
            vin: vin || undefined,
            status: "customerOwned",
          });
        }
        if (complaint && vehicleId) {
          await checkIn.mutateAsync({
            vehicleId: vehicleId as Id<"vehicles">,
            customerId: customerId as Id<"customers">,
            complaint,
          });
          toast.success("Customer, vehicle, and job created.");
          void queryClient.invalidateQueries();
          onDone();
          return;
        }
        toast.success("Customer created.");
        if (vehicleId) toast.success("Vehicle added.");
        void queryClient.invalidateQueries();
        onDone();
      } catch (err: any) {
        const raw = err?.message ?? "Failed to create customer.";
        const data = err?.data;
        if (data?.existingCustomerId) {
          setDuplicateInfo({
            id: data.existingCustomerId,
            name: data.existingName ?? "",
            phone: data.existingPhone ?? "",
          });
          toast.error(data.message ?? raw);
          return;
        }
        const m = raw.match(/Existing customerId:\s*(\w+)/);
        if (m) setDuplicateInfo({ id: m[1]!, name: "", phone: "" });
        toast.error(raw);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const saving =
    createCustomer.isPending || createVehicle.isPending || checkIn.isPending || formik.isSubmitting;
  const gateDone = hasSearched && gateQ.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New customer</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mandatory search gate */}
        <div className="mb-6 rounded-xl border border-line bg-bg p-4">
          <Label className="text-[12px] font-bold tracking-wide text-ink">
            Step 1 — Search existing customers (required)
          </Label>
          <p className="mt-1 text-[12.5px] text-mute">
            Search by name <b>and</b> phone to avoid duplicates. View results
            before the form unlocks.
          </p>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <IconSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
              />
              <Input
                placeholder="Name or phone..."
                value={gateQ}
                onChange={(e) => setGateQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGateSearch();
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGateSearch}
            >
              <IconSearch size={14} /> Search
            </Button>
          </div>
          {hasSearched && (
            <div className="mt-3 rounded-lg border border-line bg-surface p-3">
              {!gateQ.trim() ? (
                <p className="text-[12.5px] text-mute">Enter a search term.</p>
              ) : gateResults === undefined ? (
                <p className="text-[12.5px] text-mute">Searching...</p>
              ) : gateResults.length === 0 ? (
                <p className="text-[12.5px] font-medium text-emerald-700">
                  No matches — you can create this customer.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-mute">
                    {gateResults.length} match
                    {gateResults.length !== 1 ? "es" : ""} — reuse existing if
                    relevant
                  </p>
                  {gateResults.slice(0, 5).map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                        <Avatar name={c.name} size={24} />
                        {c.name}{" "}
                        <span className="font-normal text-mute">
                          · {c.phone}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate({
                            to: "/service/customer/$id",
                            params: { id: c._id },
                          })
                        }
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!hasSearched && (
            <p className="mt-2 text-[11.5px] font-medium text-amber-700">
              Search required before the create form unlocks.
            </p>
          )}
        </div>

        {duplicateInfo && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px]">
            <span className="font-semibold text-red-700">
              Duplicate detected:
            </span>{" "}
            <span className="text-body">
              Phone already exists
              {duplicateInfo.name ? ` for ${duplicateInfo.name}` : ""}.
            </span>{" "}
            <Link
              to="/service/customer/$id"
              params={{ id: duplicateInfo.id }}
              className="font-semibold text-red-700 underline"
            >
              Use existing customer
            </Link>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
          <fieldset
            disabled={!gateDone}
            className={`${!gateDone ? "opacity-50" : ""} space-y-6`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.name && formik.errors.name)} />
                <FieldError touched={formik.touched.name} error={formik.errors.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.phone && formik.errors.phone)} />
                <FieldError touched={formik.touched.phone} error={formik.errors.phone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.email && formik.errors.email)} />
                <FieldError touched={formik.touched.email} error={formik.errors.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              </div>
            </div>

            <div className="border-t border-line-soft pt-5">
              <h3 className="mb-3 text-[13px] font-bold text-ink">
                Vehicle{" "}
                <span className="font-medium text-mute">(optional)</span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" value={formik.values.make} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.make && formik.errors.make)} />
                  <FieldError touched={formik.touched.make} error={formik.errors.make as string} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" value={formik.values.model} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" min={1900} value={formik.values.year} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.year && formik.errors.year)} />
                  <FieldError touched={formik.touched.year} error={formik.errors.year} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Colour</Label>
                  <Input id="color" name="color" value={formik.values.color} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Plate</Label>
                  <Input
                    id="plate"
                    name="plate"
                    placeholder="LSD-123-HG"
                    value={formik.values.plate}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                    aria-invalid={!!(formik.touched.plate && formik.errors.plate)}
                  />
                  <FieldError touched={formik.touched.plate} error={formik.errors.plate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    name="vin"
                    value={formik.values.vin}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>
              {(formik.errors as any)._form && formik.touched.make && (
                <p className="mt-2 text-[11.5px] font-medium text-rose-600">{(formik.errors as any)._form as string}</p>
              )}
            </div>

            <div className="border-t border-line-soft pt-5">
              <h3 className="mb-3 text-[13px] font-bold text-ink">
                Complaint{" "}
                <span className="font-medium text-mute">(optional)</span>
              </h3>
              <div className="space-y-2">
                <Label htmlFor="complaint">Describe the issue</Label>
                <Textarea
                  id="complaint"
                  name="complaint"
                  placeholder="Customer's reported complaint..."
                  value={formik.values.complaint}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !gateDone}>
              {saving ? "Saving..." : "Save customer"}
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
