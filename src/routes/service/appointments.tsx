import { useState } from "react";
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
import { Badge } from "~/components/ui/badge";
import { Loader } from "~/components/Loader";
import { IconChevronRight, IconPlus, IconX } from "~/components/icons";
import { normalizeCustomerCreateInput } from "~/lib/customer-create";
import {
  appointmentQueries,
  useCreateAppointmentMutation,
  useCancelAppointmentMutation,
  useMarkAppointmentCheckedInMutation,
  customerQueries,
  useCheckInMutation,
  useCreateCustomerMutation,
  useCreateVehicleMutation,
} from "~/lib/queries";
import type { Doc, Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/service/appointments")({
  component: AppointmentsPage,
});

const APPOINTMENT_STATUS_VARIANTS: Record<
  string,
  "info" | "success" | "destructive"
> = {
  scheduled: "info",
  checkedIn: "success",
  cancelled: "destructive",
};

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  checkedIn: "Checked In",
  cancelled: "Cancelled",
};

type RangePreset = "today" | "week" | "month";

function getRange(preset: RangePreset): { startDate: number; endDate: number } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = now.getTime();
  if (preset === "today")
    return { startDate: start, endDate: start + 86_400_000 };
  if (preset === "week")
    return { startDate: start, endDate: start + 7 * 86_400_000 };
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return { startDate: start, endDate: nextMonth.getTime() };
}

const RANGE_LABELS: Record<RangePreset, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

type AppointmentGroup = {
  date: string;
  ts: number;
  items: Doc<"appointments">[];
};

function groupByDay(appointments: Doc<"appointments">[]): AppointmentGroup[] {
  const groups: AppointmentGroup[] = [];
  for (const a of appointments) {
    const dayKey = new Date(a.appointmentTs).toDateString();
    const dayTs = new Date(a.appointmentTs);
    dayTs.setHours(0, 0, 0, 0);
    const existing = groups[groups.length - 1];
    if (existing && existing.date === dayKey) {
      existing.items.push(a);
    } else {
      groups.push({ date: dayKey, ts: dayTs.getTime(), items: [a] });
    }
  }
  return groups;
}

function AppointmentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [preset, setPreset] = useState<RangePreset>("week");
  const [showCreate, setShowCreate] = useState(false);

  const { startDate, endDate } = getRange(preset);
  const { data: appointments, isLoading } = useQuery(
    appointmentQueries.listRange(startDate, endDate),
  );

  const dayGroups = appointments ? groupByDay(appointments) : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            Appointments
          </h1>
          <p className="mt-1 text-[13px] text-mute">
            {appointments
              ? `${appointments.length} upcoming`
              : "Manage service appointments."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-0.5">
            {(Object.keys(RANGE_LABELS) as RangePreset[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  preset === key
                    ? "bg-accent text-white"
                    : "text-mute hover:text-ink"
                }`}
                onClick={() => setPreset(key)}
              >
                {RANGE_LABELS[key]}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <IconPlus size={15} /> Book appointment
          </Button>
        </div>
      </div>

      {showCreate && (
        <CreateAppointmentForm
          onDone={() => {
            setShowCreate(false);
            void queryClient.invalidateQueries();
          }}
        />
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date / Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Complaint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Loader />
                </TableCell>
              </TableRow>
            ) : !appointments || appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-mute">
                  No appointments in this range.
                </TableCell>
              </TableRow>
            ) : (
              dayGroups.flatMap((group) => [
                <TableRow key={group.date} className="bg-line-soft/40">
                  <TableCell
                    colSpan={7}
                    className="py-2 pl-4 text-[12px] font-semibold text-mute"
                  >
                    {new Date(group.date).toLocaleDateString("en-NG", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year:
                        group.ts < Date.now() - 6 * 86_400_000 ||
                        group.ts > Date.now() + 6 * 86_400_000
                          ? "numeric"
                          : undefined,
                    })}
                    {" — "}
                    {group.items.length} appointment
                    {group.items.length !== 1 ? "s" : ""}
                  </TableCell>
                </TableRow>,
                ...group.items.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="whitespace-nowrap font-semibold text-ink">
                      {new Date(a.appointmentTs).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-body">
                      {a.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-mute">
                      {a.phone}
                    </TableCell>
                    <TableCell className="text-body">
                      {[a.vehicleMake, a.vehicleModel, a.vehiclePlate]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-mute">
                      {a.complaint ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        dot
                        variant={
                          APPOINTMENT_STATUS_VARIANTS[a.status] ?? "secondary"
                        }
                      >
                        {APPOINTMENT_STATUS_LABELS[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.status === "scheduled" && (
                        <div className="flex gap-1">
                          <AppointmentCheckInButton
                            appointment={a}
                            onDone={() => void queryClient.invalidateQueries()}
                          />
                          <CancelButton
                            appointmentId={a._id}
                            onDone={() => void queryClient.invalidateQueries()}
                          />
                        </div>
                      )}
                      {a.status === "checkedIn" && a.checkInJobId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate({
                              to: "/service/job/$id",
                              params: { id: a.checkInJobId! },
                            })
                          }
                        >
                          View job <IconChevronRight size={13} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )),
              ])
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function AppointmentCheckInButton({
  appointment,
  onDone,
}: {
  appointment: {
    _id: string;
    customerId?: string;
    name?: string;
    phone?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    complaint?: string;
  };
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const checkIn = useCheckInMutation();
  const markCheckedIn = useMarkAppointmentCheckedInMutation();
  const createCustomer = useCreateCustomerMutation();
  const createVehicle = useCreateVehicleMutation();
  const queryClient = useQueryClient();

  async function handleCheckIn() {
    setLoading(true);
    try {
      let customerId: string | undefined = (appointment as any).customerId;
      // If appointment already has a customerId, use it; otherwise resolve via phone/name
      if (!customerId) {
        const phone = (appointment.phone ?? "").trim();
        const name = (appointment.name ?? "").trim();
        if (phone) {
          const customers = await queryClient.fetchQuery(
            customerQueries.search(phone),
          );
          if (customers && customers.length > 0) {
            // Prefer exact phone match if available
            const exact = customers.find((c) => c.phone.trim() === phone);
            customerId = (exact ?? customers[0])!._id;
          }
        }
        if (!customerId && appointment.name && appointment.phone) {
          try {
            customerId = await createCustomer.mutateAsync({
              name: appointment.name,
              phone: appointment.phone,
            });
          } catch (e: any) {
            // If duplicate guard fired, use suggested existing id
            if (e?.data?.existingCustomerId)
              customerId = e.data.existingCustomerId;
            else throw e;
          }
        }
        if (!customerId)
          throw new Error("Could not resolve customer for this appointment.");
      }

      const hasVehicle = !!(
        appointment.vehicleMake && appointment.vehicleModel
      );
      let vehicleId: string | null = null;

      if (hasVehicle) {
        const plate = appointment.vehiclePlate?.trim();
        if (plate) {
          try {
            const { vehicleQueries } = await import("~/lib/queries");
            const existing: any = await queryClient.fetchQuery(
              vehicleQueries.byPlate(plate),
            );
            if (existing?._id) vehicleId = existing._id;
          } catch {}
        }
        if (!vehicleId) {
          try {
            vehicleId = await createVehicle.mutateAsync({
              ownerId: customerId as Id<"customers">,
              make: appointment.vehicleMake!,
              model: appointment.vehicleModel!,
              year: new Date().getFullYear(),
              color: "N/A",
              plate: appointment.vehiclePlate || undefined,
              status: "customerOwned",
            });
          } catch (e: any) {
            if (e?.message?.includes("already exists") && plate) {
              try {
                const { vehicleQueries } = await import("~/lib/queries");
                const v: any = await queryClient.fetchQuery(
                  vehicleQueries.byPlate(plate),
                );
                if (v?._id) vehicleId = v._id;
                else throw e;
              } catch {
                throw e;
              }
            } else throw e;
          }
        }
      }

      if (vehicleId && appointment.complaint) {
        const jobId = await checkIn.mutateAsync({
          vehicleId: vehicleId as Id<"vehicles">,
          customerId: customerId as Id<"customers">,
          complaint: appointment.complaint,
        });

        await markCheckedIn.mutateAsync({
          appointmentId: appointment._id as Id<"appointments">,
          jobId: jobId as Id<"jobs">,
        });
      }

      toast.success("Appointment checked in.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleCheckIn}
      disabled={loading}
    >
      {loading ? "..." : "Check in"}
    </Button>
  );
}

function CancelButton({
  appointmentId,
  onDone,
}: {
  appointmentId: string;
  onDone: () => void;
}) {
  const cancel = useCancelAppointmentMutation();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await cancel.mutateAsync({
          appointmentId: appointmentId as Id<"appointments">,
        });
        toast.success("Appointment cancelled.");
        onDone();
      }}
      disabled={cancel.isPending}
    >
      <IconX size={14} />
    </Button>
  );
}

function CreateAppointmentForm({ onDone }: { onDone: () => void }) {
  const create = useCreateAppointmentMutation();
  const createCustomer = useCreateCustomerMutation();
  const todayStr = new Date().toLocaleDateString("en-CA");

  const [customerQ, setCustomerQ] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    _id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  } | null>(null);

  const { data: searchResults } = useQuery({
    ...customerQueries.search(customerQ.trim()),
    enabled: hasSearched && customerQ.trim().length > 0,
  });

  function doSearch() {
    if (!customerQ.trim()) {
      toast.error("Enter name or phone to search");
      return;
    }
    setHasSearched(true);
  }

  const inlineSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().min(1, "Phone is required").regex(/^[\d\s+\-()]+$/, "Phone must contain only numbers, spaces, +, -, ( )").refine((v) => { const d = v.replace(/\D/g, ""); return d.length >= 7 && d.length <= 15; }, { message: "Phone must be 7-15 digits" }),
    email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
    address: z.string().trim().optional().or(z.literal("")),
  });

  const inlineFormik = useFormik({
    initialValues: { name: "", phone: "", email: "", address: "" },
    validate: zodToFormikValidate(inlineSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const normalized = normalizeCustomerCreateInput(values);
      if (!normalized.name || !normalized.phone) {
        toast.error("Name and phone required to create customer");
        setSubmitting(false);
        return;
      }
      try {
        const id = await createCustomer.mutateAsync(normalized);
        setSelectedCustomer({
          _id: id as string,
          name: normalized.name,
          phone: normalized.phone,
          email: normalized.email,
          address: normalized.address,
        });
        resetForm();
        toast.success("Customer created — now complete booking");
      } catch (e: any) {
        const data = e?.data;
        if (data?.existingCustomerId) {
          toast.error(data.message ?? "Duplicate customer");
          setSelectedCustomer({
            _id: data.existingCustomerId,
            name: data.existingName ?? normalized.name,
            phone: data.existingPhone ?? normalized.phone,
            email: normalized.email,
            address: normalized.address,
          });
        } else {
          toast.error(e?.message ?? "Failed to create customer");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const bookingSchema = z.object({
    vehicleMake: z.string().trim().min(1, "Vehicle make is required"),
    vehicleModel: z.string().trim().min(1, "Vehicle model is required"),
    vehicleYear: z.string().trim().optional().or(z.literal("")).refine((v) => { if (!v) return true; const n = Number(v); return !Number.isNaN(n) && n >= 1900 && n <= new Date().getFullYear() + 1; }, { message: "Vehicle year must be a valid year." }),
    vehicleColor: z.string().trim().optional().or(z.literal("")),
    vehiclePlate: z.string().trim().min(1, "Plate is required").refine((val) => /^[A-Z0-9][A-Z0-9 -]{2,}$/.test(val.trim().toUpperCase()), { message: "Plate must be 3+ chars, uppercase alphanumerics, spaces or hyphens" }),
    vehicleVin: z.string().trim().optional().or(z.literal("")),
    complaint: z.string().trim().min(1, "Complaint is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
  }).superRefine((v, ctx) => {
    if (v.date && v.time) {
      const ts = new Date(`${v.date}T${v.time}`).getTime();
      if (isNaN(ts)) ctx.addIssue({ code: "custom", path: ["date"], message: "Invalid date or time." });
      else if (ts < Date.now() - 60_000) ctx.addIssue({ code: "custom", path: ["date"], message: "Appointment date cannot be in the past." });
    }
  });

  const bookingFormik = useFormik({
    initialValues: { vehicleMake: "", vehicleModel: "", vehicleYear: "", vehicleColor: "", vehiclePlate: "", vehicleVin: "", complaint: "", date: "", time: "" },
    validate: zodToFormikValidate(bookingSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      if (!hasSearched) { toast.error("Search for a customer first."); setSubmitting(false); return; }
      if (!selectedCustomer) { toast.error("Pick or create a customer before booking."); setSubmitting(false); return; }
      const vehicleYear = values.vehicleYear ? Number(values.vehicleYear) : undefined;
      const appointmentTs = new Date(`${values.date}T${values.time}`).getTime();
      try {
        await create.mutateAsync({
          customerId: selectedCustomer._id as Id<"customers">,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          vehicleMake: values.vehicleMake.trim(),
          vehicleModel: values.vehicleModel.trim(),
          vehicleYear: vehicleYear || undefined,
          vehicleColor: values.vehicleColor.trim() || undefined,
          vehiclePlate: values.vehiclePlate.trim(),
          vehicleVin: values.vehicleVin.trim() || undefined,
          complaint: values.complaint.trim(),
          appointmentTs,
        });
        toast.success("Appointment booked.");
        onDone();
      } catch (err: any) { toast.error(err?.message ?? "Failed to book"); }
      finally { setSubmitting(false); }
    },
  });

  const canBook = !!selectedCustomer;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book appointment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Customer gate */}
        <div className="mb-5 rounded-xl border border-line bg-bg p-4">
          <Label className="text-[12px] font-bold tracking-wide text-ink">
            Customer (required) — search first
          </Label>
          <p className="mt-1 text-[12.5px] text-mute">
            Search by name <b>and</b> phone, pick an existing customer, or
            create inline after viewing results.
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Search name or phone..."
              value={customerQ}
              onChange={(e) => setCustomerQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  doSearch();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={doSearch}>
              Search
            </Button>
          </div>

          {hasSearched && (
            <div className="mt-3 rounded-lg border border-line bg-surface p-3">
              {!customerQ.trim() ? (
                <p className="text-[12.5px] text-mute">Enter a term.</p>
              ) : searchResults === undefined ? (
                <p className="text-[12.5px] text-mute">Searching...</p>
              ) : searchResults.length === 0 ? (
                <form onSubmit={inlineFormik.handleSubmit} className="space-y-3" noValidate>
                  <p className="text-[12.5px] font-medium text-emerald-700">
                    No matches — create customer inline:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Input placeholder="Full name *" name="name" value={inlineFormik.values.name} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} aria-invalid={!!(inlineFormik.touched.name && inlineFormik.errors.name)} />
                      <FieldError touched={inlineFormik.touched.name} error={inlineFormik.errors.name} />
                    </div>
                    <div className="space-y-1">
                      <Input placeholder="Phone *" name="phone" value={inlineFormik.values.phone} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} aria-invalid={!!(inlineFormik.touched.phone && inlineFormik.errors.phone)} />
                      <FieldError touched={inlineFormik.touched.phone} error={inlineFormik.errors.phone} />
                    </div>
                    <div className="space-y-1">
                      <Input placeholder="Email" type="email" name="email" value={inlineFormik.values.email} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} aria-invalid={!!(inlineFormik.touched.email && inlineFormik.errors.email)} />
                      <FieldError touched={inlineFormik.touched.email} error={inlineFormik.errors.email} />
                    </div>
                    <Input placeholder="Address" name="address" value={inlineFormik.values.address} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} />
                  </div>
                  <Button type="submit" size="sm" disabled={inlineFormik.isSubmitting || createCustomer.isPending}>
                    {inlineFormik.isSubmitting || createCustomer.isPending ? "Creating..." : "Create customer"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-mute">
                    {searchResults.length} match
                    {searchResults.length !== 1 ? "es" : ""}
                  </p>
                  {searchResults.slice(0, 6).map((c) => {
                    const active = selectedCustomer?._id === c._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() =>
                          setSelectedCustomer({
                            _id: c._id,
                            name: c.name,
                            phone: c.phone,
                            email: c.email,
                            address: c.address,
                          })
                        }
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${active ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-bg"}`}
                      >
                        <span className="text-[13px] font-semibold text-ink">
                          {c.name}{" "}
                          <span className="font-normal text-mute">
                            · {c.phone}
                          </span>
                        </span>
                        {active && (
                          <span className="text-[11px] font-bold text-accent">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <form onSubmit={inlineFormik.handleSubmit} className="border-t border-line-soft pt-3 space-y-2" noValidate>
                    <p className="mb-2 text-[12px] font-semibold text-ink">
                      Or create new (after seeing results):
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Input placeholder="Full name *" name="name" value={inlineFormik.values.name} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} aria-invalid={!!(inlineFormik.touched.name && inlineFormik.errors.name)} />
                        <FieldError touched={inlineFormik.touched.name} error={inlineFormik.errors.name} />
                      </div>
                      <div className="space-y-1">
                        <Input placeholder="Phone *" name="phone" value={inlineFormik.values.phone} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} aria-invalid={!!(inlineFormik.touched.phone && inlineFormik.errors.phone)} />
                        <FieldError touched={inlineFormik.touched.phone} error={inlineFormik.errors.phone} />
                      </div>
                      <Input placeholder="Email" type="email" name="email" value={inlineFormik.values.email} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} />
                      <Input placeholder="Address" name="address" value={inlineFormik.values.address} onChange={inlineFormik.handleChange} onBlur={inlineFormik.handleBlur} />
                    </div>
                    <Button type="submit" size="sm" className="mt-2" variant="outline" disabled={inlineFormik.isSubmitting || createCustomer.isPending}>
                      {inlineFormik.isSubmitting || createCustomer.isPending ? "Creating..." : "Create & select"}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

          {selectedCustomer && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="text-[13px] font-semibold text-emerald-800">
                {selectedCustomer.name} · {selectedCustomer.phone}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Change
              </Button>
            </div>
          )}
          {!hasSearched && (
            <p className="mt-2 text-[11.5px] font-medium text-amber-700">
              Search required before booking.
            </p>
          )}
          {hasSearched && !selectedCustomer && (
            <p className="mt-2 text-[11.5px] font-medium text-amber-700">
              Pick or create a customer to unlock booking.
            </p>
          )}
        </div>

        <form onSubmit={bookingFormik.handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <fieldset
            disabled={!canBook}
            className={`contents ${!canBook ? "opacity-50" : ""}`}
          >
            <div className="space-y-2">
              <Label>Selected customer</Label>
              <Input
                value={
                  selectedCustomer
                    ? `${selectedCustomer.name} · ${selectedCustomer.phone}`
                    : "No customer selected"
                }
                disabled
                className="bg-bg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" min={todayStr} value={bookingFormik.values.date} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.date && bookingFormik.errors.date)} />
              <FieldError touched={bookingFormik.touched.date} error={bookingFormik.errors.date} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input id="time" name="time" type="time" value={bookingFormik.values.time} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.time && bookingFormik.errors.time)} />
              <FieldError touched={bookingFormik.touched.time} error={bookingFormik.errors.time} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleMake">Vehicle make *</Label>
              <Input id="vehicleMake" name="vehicleMake" value={bookingFormik.values.vehicleMake} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.vehicleMake && bookingFormik.errors.vehicleMake)} />
              <FieldError touched={bookingFormik.touched.vehicleMake} error={bookingFormik.errors.vehicleMake} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Vehicle model *</Label>
              <Input id="vehicleModel" name="vehicleModel" value={bookingFormik.values.vehicleModel} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.vehicleModel && bookingFormik.errors.vehicleModel)} />
              <FieldError touched={bookingFormik.touched.vehicleModel} error={bookingFormik.errors.vehicleModel} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleYear">Year</Label>
              <Input id="vehicleYear" name="vehicleYear" type="number" min={1900} max={new Date().getFullYear() + 1} value={bookingFormik.values.vehicleYear} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.vehicleYear && bookingFormik.errors.vehicleYear)} onInput={(e) => { const t = e.currentTarget; t.value = t.value.slice(0, 4); bookingFormik.handleChange(e); }} />
              <FieldError touched={bookingFormik.touched.vehicleYear} error={bookingFormik.errors.vehicleYear} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleColor">Colour</Label>
              <Input id="vehicleColor" name="vehicleColor" value={bookingFormik.values.vehicleColor} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate">Plate *</Label>
              <Input id="vehiclePlate" name="vehiclePlate" placeholder="LSD-123-HG" value={bookingFormik.values.vehiclePlate} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); bookingFormik.handleChange(e); }} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.vehiclePlate && bookingFormik.errors.vehiclePlate)} />
              <FieldError touched={bookingFormik.touched.vehiclePlate} error={bookingFormik.errors.vehiclePlate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleVin">VIN</Label>
              <Input id="vehicleVin" name="vehicleVin" value={bookingFormik.values.vehicleVin} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); bookingFormik.handleChange(e); }} onBlur={bookingFormik.handleBlur} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="complaint">Complaint *</Label>
              <Textarea id="complaint" name="complaint" rows={2} value={bookingFormik.values.complaint} onChange={bookingFormik.handleChange} onBlur={bookingFormik.handleBlur} aria-invalid={!!(bookingFormik.touched.complaint && bookingFormik.errors.complaint)} />
              <FieldError touched={bookingFormik.touched.complaint} error={bookingFormik.errors.complaint} />
            </div>
          </fieldset>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={create.isPending || bookingFormik.isSubmitting || !canBook}>
              {create.isPending || bookingFormik.isSubmitting ? "Booking..." : "Book appointment"}
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
