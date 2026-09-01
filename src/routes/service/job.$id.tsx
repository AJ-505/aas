import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Loader } from "~/components/Loader";
import { Avatar } from "~/components/Avatar";
import {
  IconCar,
  IconCheck,
  IconChevronRight,
  IconUsers,
} from "~/components/icons";
import {
  jobQueries,
  partQueries,
  labourTypeQueries,
  invoiceQueries,
  useDiagnoseMutation,
  useMarkReadyMutation,
  useCompleteMutation,
  useAddJobItemMutation,
  useRemoveJobItemMutation,
  useGenerateInvoiceMutation,
  useRegenerateInvoiceMutation,
  useApproveInvoiceMutation,
  useCreateEstimateMutation,
  useApproveEstimateMutation,
  useRejectEstimateMutation,
  useAdminUnlockMutation,
  useReverseReadyMutation,
  useRecordPaymentMutation,
  useMarkPaidMutation,
} from "~/lib/queries";
import { PrintableJobCard } from "~/components/PrintableJobCard";
import { PrintableInvoice } from "~/components/PrintableInvoice";
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_ITEM_TYPE_LABELS,
  type JobStatus,
} from "~/lib/enums";
import { JOB_STATUS_VARIANTS } from "~/lib/status-ui";
import { nextStatuses } from "~/lib/job-utils";
import { formatNaira, formatDateTime, nairaToKobo } from "~/lib/format";
import { useCurrentUser } from "~/lib/auth";
import { cn } from "~/lib/utils";
import type { Id } from "convex/_generated/dataModel";

export const Route = createFileRoute("/service/job/$id")({
  component: JobDetailPage,
});

function JobDetailPage() {
  const { id: jobId } = Route.useParams();
  const { data, isLoading } = useQuery(jobQueries.detail(jobId));
  const { data: me } = useCurrentUser();

  if (isLoading) return <Loader />;
  if (!data || !data.job) {
    return (
      <div className="space-y-4">
        <p className="text-mute">Job not found.</p>
        <Link
          to="/service/jobs"
          search={{}}
          className="text-[13px] font-semibold text-accent hover:underline"
        >
          &larr; Back to jobs
        </Link>
      </div>
    );
  }

  const {
    job,
    vehicle,
    customer,
    diagnosedBy,
    csr,
    jobItems,
    invoice,
    payments,
  } = data;

  const canDiagnose =
    me?.role === "admin" ||
    me?.role === "manager" ||
    me?.role === "inventoryManager";

  const canAddItems = [
    "inventoryManager",
    "finance",
    "manager",
    "admin",
  ].includes(me?.role ?? "");
  const canAddParts = ["inventoryManager", "manager", "admin"].includes(
    me?.role ?? "",
  );
  const canSeeInvoice = true;
  const canPrintJobCard = [
    "manager",
    "inventoryManager",
    "csr",
    "admin",
  ].includes(me?.role ?? "");

  const allowedNext = nextStatuses(job.status as JobStatus);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/service/jobs"
            search={{}}
            className="flex w-fit items-center gap-1 text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
          >
            <IconChevronRight size={13} className="rotate-180" /> Back to jobs
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
              Job #{job._id.slice(-6)}
            </h1>
            <Badge
              dot
              variant={
                JOB_STATUS_VARIANTS[job.status as JobStatus] ?? "secondary"
              }
            >
              {JOB_STATUS_LABELS[job.status as JobStatus]}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-mute">
            Checked in {formatDateTime(job.checkInTs)}
            {diagnosedBy ? ` · Diagnosed by: ${diagnosedBy.name}` : ""}
            {csr ? ` · Front desk: ${csr.name}` : ""}
          </p>
        </div>

        {canPrintJobCard && (
          <PrintableJobCard
            job={job}
            vehicle={vehicle}
            customer={customer}
            csr={csr}
          />
        )}
      </div>

      {/* status stepper */}
      <Card className="overflow-x-auto px-[18px] py-4">
        <StatusStepper status={job.status as JobStatus} />
      </Card>

      {/* vehicle + customer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <span className="grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent">
              <IconCar size={14} />
            </span>
            <CardTitle>Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-[13px]">
            {vehicle ? (
              <>
                <p className="font-semibold text-ink">
                  {vehicle.make} {vehicle.model}{" "}
                  <span className="font-normal text-mute">
                    ({vehicle.year})
                  </span>
                </p>
                <p className="text-mute">
                  Colour: <span className="text-body">{vehicle.color}</span>
                </p>
                {vehicle.plate && (
                  <p className="text-mute">
                    Plate:{" "}
                    <span className="font-medium uppercase tracking-wide text-body">
                      {vehicle.plate}
                    </span>
                  </p>
                )}
                {vehicle.vin && (
                  <p className="text-mute">
                    VIN: <span className="text-body">{vehicle.vin}</span>
                  </p>
                )}
              </>
            ) : (
              <p className="text-mute">Vehicle not found.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <span className="grid size-[26px] place-items-center rounded-lg bg-accent-soft text-accent">
              <IconUsers size={14} />
            </span>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-[13px]">
            {customer ? (
              <div className="flex items-center gap-3">
                <Avatar name={customer.name} size={36} />
                <div>
                  <p className="font-semibold text-ink">{customer.name}</p>
                  <p className="text-mute">
                    Phone: <span className="text-body">{customer.phone}</span>
                  </p>
                  {customer.email && (
                    <p className="text-mute">
                      Email: <span className="text-body">{customer.email}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-mute">Customer not found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* complaint + diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] leading-relaxed text-body">
            {job.complaint}
          </p>
          {job.diagnosis && (
            <div className="mt-4 border-t border-line-soft pt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-mute">
                Diagnosis
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-body">
                {job.diagnosis}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* status actions */}
      {allowedNext.length > 0 && (
        <StatusActions jobId={job._id} allowedNext={allowedNext} />
      )}

      {/* diagnosis form */}
      {job.status === "checkedIn" && canDiagnose && (
        <DiagnosisForm jobId={job._id} />
      )}

      {/* add spare parts form - only after diagnosis and for inventory roles */}
      {["diagnosed", "inProgress"].includes(job.status) &&
        canAddParts &&
        !!job.diagnosis?.trim() && <AddPartForm jobId={job._id} />}
      {canAddParts &&
        ["checkedIn", "diagnosed", "inProgress"].includes(job.status) &&
        (!job.diagnosis || !job.diagnosis.trim()) && (
          <Card>
            <CardHeader>
              <CardTitle>Spare parts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] text-mute">
                Diagnosis is required before spare parts can be added to this
                job.
              </p>
            </CardContent>
          </Card>
        )}

      {/* job items (parts + labour) */}
      {["diagnosed", "inProgress"].includes(job.status) && canAddItems && (
        <AddJobItemForm jobId={job._id} />
      )}

      <JobItemsTable
        jobItems={jobItems}
        canRemove={
          canAddItems &&
          ["checkedIn", "diagnosed", "inProgress"].includes(job.status)
        }
      />

      {/* invoice */}
      {job.status !== "checkedIn" && canSeeInvoice && (
        <InvoiceSection
          jobId={job._id}
          invoice={invoice}
          job={job}
          customer={customer}
          vehicle={vehicle}
          payments={payments}
          hasItems={jobItems.length > 0}
        />
      )}

      {/* mark paid */}
      {job.status === "completed" &&
        (me?.role === "finance" ||
          me?.role === "manager" ||
          me?.role === "admin") &&
        invoice?.paid && <MarkPaidButton jobId={job._id} />}
    </div>
  );
}

function StatusStepper({ status }: { status: JobStatus }) {
  const current = JOB_STATUSES.indexOf(status);
  return (
    <div className="flex min-w-max items-center">
      {JOB_STATUSES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border-2 transition-colors",
                  done && "border-accent bg-accent text-white",
                  active && "border-accent bg-accent-soft text-accent",
                  !done && !active && "border-line bg-white text-mute",
                )}
              >
                {done ? (
                  <IconCheck size={12} />
                ) : (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      active ? "bg-accent" : "bg-line",
                    )}
                  />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide",
                  active
                    ? "text-accent-deep"
                    : done
                      ? "text-body"
                      : "text-mute",
                )}
              >
                {JOB_STATUS_LABELS[s]}
              </span>
            </div>
            {i < JOB_STATUSES.length - 1 && (
              <span
                className={cn(
                  "mx-2 mb-5 h-0.5 w-8 rounded-full sm:w-10",
                  i < current ? "bg-accent" : "bg-line-soft",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusActions({
  jobId,
  allowedNext,
}: {
  jobId: string;
  allowedNext: JobStatus[];
}) {
  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();
  const { data: detail } = useQuery(jobQueries.detail(jobId));
  const markReady = useMarkReadyMutation();
  const complete = useCompleteMutation();
  const reverseReady = useReverseReadyMutation();

  function invalidate() {
    void queryClient.invalidateQueries();
  }

  function handleTransition(target: JobStatus) {
    const opts = {
      onSuccess: () => {
        toast.success(`Job moved to ${JOB_STATUS_LABELS[target]}`);
        invalidate();
      },
      onError: (e: any) => toast.error(e.message),
    };
    if (target === "readyForPickup")
      markReady.mutate({ jobId: jobId as Id<"jobs"> }, opts);
    else if (target === "completed")
      complete.mutate({ jobId: jobId as Id<"jobs"> }, opts);
  }

  const role = me?.role;
  const canMarkReady =
    role === "inventoryManager" || role === "manager" || role === "admin";
  const canComplete = role === "manager" || role === "admin";
  const canReverse = role === "manager" || role === "admin";
  const isReady = detail?.job?.status === "readyForPickup";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {allowedNext.includes("readyForPickup") && canMarkReady && (
          <Button
            onClick={() => handleTransition("readyForPickup")}
            disabled={markReady.isPending}
          >
            {markReady.isPending ? "Updating..." : "Mark Ready for Pickup"}
          </Button>
        )}
        {allowedNext.includes("completed") && canComplete && (
          <Button
            onClick={() => handleTransition("completed")}
            disabled={complete.isPending}
          >
            {complete.isPending ? "Completing..." : "Mark Completed"}
          </Button>
        )}
        {isReady && canReverse && (
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() =>
              reverseReady.mutate(
                { jobId: jobId as Id<"jobs"> },
                {
                  onSuccess: () => {
                    toast.success("Reversed — back to In Progress");
                    invalidate();
                  },
                  onError: (e: any) => toast.error(e.message),
                },
              )
            }
            disabled={reverseReady.isPending}
          >
            {reverseReady.isPending
              ? "Reversing..."
              : "↩ Reverse Ready for Pickup"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DiagnosisForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const diagnose = useDiagnoseMutation();
  const [diagnosis, setDiagnosis] = useState("");

  function handleSubmit(e: React.ChangeEvent) {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Diagnosis cannot be empty.");
      return;
    }
    diagnose.mutate(
      { jobId: jobId as Id<"jobs">, diagnosis: diagnosis.trim() },
      {
        onSuccess: () => {
          toast.success("Diagnosis saved.");
          setDiagnosis("");
          void queryClient.invalidateQueries();
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record diagnosis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Label htmlFor="diagnosis">
            What did you find during inspection?
          </Label>
          <Textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Describe the issue identified..."
          />
          <Button type="submit" disabled={diagnose.isPending}>
            {diagnose.isPending ? "Saving..." : "Save Diagnosis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddJobItemForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const { data: labourTypes } = useQuery(labourTypeQueries.list());
  const addJobItem = useAddJobItemMutation();
  const [labourTypeId, setLabourTypeId] = useState("");

  const selectedLabour = labourTypes?.find(
    (lt: any) => lt._id === labourTypeId,
  );
  const unitPrice = selectedLabour?.fixedPrice ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!labourTypeId) {
      toast.error("Select a labour type.");
      return;
    }
    addJobItem.mutate(
      {
        jobId: jobId as Id<"jobs">,
        type: "labour",
        labourTypeId: labourTypeId as Id<"labourTypes">,
        qty: 1,
        unitPrice,
      },
      {
        onSuccess: () => {
          toast.success("Labour cost added.");
          setLabourTypeId("");
          void queryClient.invalidateQueries();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add labour cost</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="labour">Labour type</Label>
            <Select
              id="labour"
              value={labourTypeId}
              onChange={(e) => setLabourTypeId(e.target.value)}
            >
              <option value="" disabled>
                Select labour type...
              </option>
              {labourTypes?.map((lt: any) => (
                <option key={lt._id} value={lt._id}>
                  {lt.name} ({formatNaira(lt.fixedPrice)})
                </option>
              ))}
            </Select>
          </div>
          {labourTypeId && (
            <div className="text-[13px] text-mute">
              Labour cost:{" "}
              <span className="font-bold text-ink">
                {formatNaira(unitPrice)}
              </span>
            </div>
          )}
          <Button type="submit" disabled={addJobItem.isPending}>
            {addJobItem.isPending ? "Adding..." : "Add Labour Cost"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddPartForm({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const { data: parts } = useQuery(partQueries.list());
  const addJobItem = useAddJobItemMutation();
  const [partId, setPartId] = useState("");
  const [qty, setQty] = useState(1);

  const selectedPart = parts?.find((p: any) => p._id === partId);
  const unitPrice = selectedPart?.sellingPrice ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!partId) {
      toast.error("Select a part.");
      return;
    }
    addJobItem.mutate(
      {
        jobId: jobId as Id<"jobs">,
        type: "part",
        partId: partId as Id<"parts">,
        qty,
        unitPrice,
      },
      {
        onSuccess: () => {
          toast.success("Part added to job.");
          setPartId("");
          setQty(1);
          void queryClient.invalidateQueries();
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add spare part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="partSelect">Part</Label>
              <Select
                id="partSelect"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
              >
                <option value="" disabled>
                  Select part...
                </option>
                {parts?.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.code} - {p.description} (Stock: {p.stockQty})
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-24 space-y-2">
              <Label htmlFor="partQty">Qty</Label>
              <Input
                id="partQty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>
          {partId && (
            <div className="text-[13px] text-mute">
              Unit price:{" "}
              <span className="font-bold text-ink">
                {formatNaira(unitPrice)}
              </span>
              {" · "}Total:{" "}
              <span className="font-bold text-ink">
                {formatNaira(unitPrice * qty)}
              </span>
            </div>
          )}
          <Button type="submit" disabled={addJobItem.isPending}>
            {addJobItem.isPending ? "Adding..." : "Add Part to Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function JobItemsTable({
  jobItems,
  canRemove,
}: {
  jobItems: any[];
  canRemove: boolean;
}) {
  const queryClient = useQueryClient();
  const removeItem = useRemoveJobItemMutation();
  const { data: parts } = useQuery(partQueries.list());
  const { data: labourTypes } = useQuery(labourTypeQueries.list());

  if (jobItems.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Job items</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">Line total</TableHead>
            {canRemove && (
              <TableHead className="w-32 text-right">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobItems.map((item: any) => {
            let desc = "-";
            if (item.type === "part") {
              const part = parts?.find((p: any) => p._id === item.partId);
              desc = part
                ? `${part.code} - ${part.description}`
                : item.description || "Part";
            } else if (item.type === "labour") {
              const lt = labourTypes?.find(
                (l: any) => l._id === item.labourTypeId,
              );
              desc = lt ? lt.name : item.description || "Labour";
            }

            return (
              <TableRow key={item._id}>
                <TableCell>
                  <Badge variant={item.type === "part" ? "info" : "violet"}>
                    {
                      JOB_ITEM_TYPE_LABELS[
                        item.type as keyof typeof JOB_ITEM_TYPE_LABELS
                      ]
                    }
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-ink">{desc}</TableCell>
                <TableCell className="[font-variant-numeric:tabular-nums]">
                  {item.qty}
                </TableCell>
                <TableCell className="text-right [font-variant-numeric:tabular-nums]">
                  {formatNaira(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-bold text-ink [font-variant-numeric:tabular-nums]">
                  {formatNaira(item.lineTotal)}
                </TableCell>
                {canRemove && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() =>
                        removeItem.mutate(
                          { jobItemId: item._id },
                          {
                            onSuccess: () => {
                              toast.success("Item removed.");
                              void queryClient.invalidateQueries();
                            },
                            onError: (err) => toast.error(err.message),
                          },
                        )
                      }
                    >
                      Remove
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function InvoiceSection({
  jobId,
  invoice,
  job,
  customer,
  vehicle,
  payments,
  hasItems,
}: {
  jobId: string;
  invoice: any;
  job?: any;
  customer?: any;
  vehicle?: any;
  payments: any[];
  hasItems: boolean;
}) {
  type ManualEstimateItem = {
    type: "part" | "labour";
    description: string;
    amount: string;
  };

  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();
  const { data: invoiceList } = useQuery(invoiceQueries.listByJob(jobId));
  const generate = useGenerateInvoiceMutation();
  const regenerate = useRegenerateInvoiceMutation();
  const approve = useApproveInvoiceMutation();
  const createEstimate = useCreateEstimateMutation();
  const approveEstimate = useApproveEstimateMutation();
  const rejectEstimate = useRejectEstimateMutation();
  const adminUnlock = useAdminUnlockMutation();
  const recordPayment = useRecordPaymentMutation();
  const [method, setMethod] = useState<
    "cash" | "transfer" | "card" | "pos" | "bank"
  >("cash");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {},
  );
  const [unlockReason, setUnlockReason] = useState("");
  const [manualEstimateItems, setManualEstimateItems] = useState<
    ManualEstimateItem[]
  >([{ type: "labour", description: "", amount: "" }]);
  const [showManualEstimate, setShowManualEstimate] = useState(false);

  const canFinance =
    me?.role === "finance" || me?.role === "manager" || me?.role === "admin";
  const canCsrEstimate =
    me?.role === "csr" ||
    me?.role === "manager" ||
    me?.role === "admin" ||
    me?.role === "salesRep";
  const canApproveEstimate = canFinance;
  const isAdmin = me?.role === "admin";

  const invoices: any[] = invoiceList ?? (invoice ? [invoice] : []);
  const estimates = invoices.filter((i: any) => i.kind === "estimate");
  const finals = invoices.filter((i: any) => i.kind === "final" || !i.kind);
  const finalInvoice: any = finals[0] ?? null;
  const draftEstimate: any =
    estimates.find((e: any) => e.status === "draft") ?? null;
  const approvedEstimate: any =
    estimates.find((e: any) => e.status === "approved") ?? null;

  function invalidate() {
    void queryClient.invalidateQueries();
  }

  function createManualEstimate() {
    const amounts = manualEstimateItems.map((item) =>
      Number(item.amount.replace(/,/g, "")),
    );
    const lineItems = manualEstimateItems.map((item) => ({
      type: item.type,
      description: item.description.trim(),
      qty: 1,
      unitPrice: nairaToKobo(Number(item.amount.replace(/,/g, ""))),
      lineTotal: nairaToKobo(Number(item.amount.replace(/,/g, ""))),
    }));
    if (
      lineItems.some((item) => !item.description) ||
      amounts.some((amount) => !Number.isSafeInteger(amount) || amount <= 0) ||
      lineItems.some((item) => !Number.isSafeInteger(item.unitPrice))
    ) {
      toast.error(
        "Enter a description and a whole-number amount greater than zero.",
      );
      return;
    }
    createEstimate.mutate(
      { jobId: jobId as Id<"jobs">, domain: "service", lineItems },
      {
        onSuccess: () => {
          toast.success("Manual estimate created.");
          setShowManualEstimate(false);
          setManualEstimateItems([
            { type: "labour", description: "", amount: "" },
          ]);
          invalidate();
        },
        onError: (e: any) => toast.error(e.message),
      },
    );
  }

  const manualEstimateForm = showManualEstimate && !draftEstimate && (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
      <p className="text-[13px] font-semibold text-ink">Manual estimate</p>
      {manualEstimateItems.map((item, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[120px_1fr_180px]">
          <Select
            value={item.type}
            onChange={(e) =>
              setManualEstimateItems((current) =>
                current.map((line, lineIndex) =>
                  lineIndex === index
                    ? {
                        ...line,
                        type: e.target.value as ManualEstimateItem["type"],
                      }
                    : line,
                ),
              )
            }
          >
            <option value="labour">Labour</option>
            <option value="part">Part</option>
          </Select>
          <Input
            placeholder="Description"
            value={item.description}
            onChange={(e) =>
              setManualEstimateItems((current) =>
                current.map((line, lineIndex) =>
                  lineIndex === index
                    ? { ...line, description: e.target.value }
                    : line,
                ),
              )
            }
          />
          <Input
            inputMode="numeric"
            placeholder="Amount (e.g. 20000)"
            value={item.amount}
            onChange={(e) =>
              setManualEstimateItems((current) =>
                current.map((line, lineIndex) =>
                  lineIndex === index
                    ? {
                        ...line,
                        amount: e.target.value.replace(/[^0-9,]/g, ""),
                      }
                    : line,
                ),
              )
            }
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={createManualEstimate}
          disabled={createEstimate.isPending}
        >
          {createEstimate.isPending ? "Creating..." : "Save Manual Estimate"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowManualEstimate(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  // If no invoices at all
  if (invoices.length === 0) {
    return (
      <div className="space-y-4">
        {/* Estimates empty state */}
        <Card>
          <CardHeader>
            <CardTitle>Estimates & Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canCsrEstimate && hasItems && (
              <Button
                onClick={() =>
                  createEstimate.mutate(
                    { jobId: jobId as Id<"jobs">, domain: "service" },
                    {
                      onSuccess: () => {
                        toast.success("Estimate created.");
                        invalidate();
                      },
                      onError: (e: any) => toast.error(e.message),
                    },
                  )
                }
                disabled={createEstimate.isPending}
              >
                {createEstimate.isPending ? "Creating..." : "Create Estimate"}
              </Button>
            )}
            {canCsrEstimate && !draftEstimate && !showManualEstimate && (
              <Button
                variant="outline"
                onClick={() => setShowManualEstimate(true)}
              >
                Input Manual Estimate
              </Button>
            )}
            {manualEstimateForm}
            {canFinance && hasItems && (
              <Button
                variant="outline"
                onClick={() =>
                  generate.mutate(
                    { jobId: jobId as Id<"jobs"> },
                    {
                      onSuccess: () => {
                        toast.success("Final invoice generated.");
                        invalidate();
                      },
                      onError: (e: any) => toast.error(e.message),
                    },
                  )
                }
                disabled={generate.isPending}
              >
                {generate.isPending
                  ? "Generating..."
                  : "Generate Final Invoice"}
              </Button>
            )}
            {!hasItems && (
              <p className="text-[13px] text-mute">
                Add parts or labour before invoicing. CSR can prepare estimates.
              </p>
            )}
            {!canCsrEstimate && !canFinance && (
              <p className="text-[13px] text-mute">
                Invoice not yet generated.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estimates section */}
      {estimates.length > 0 && (
        <Card className="overflow-hidden border-amber-200">
          <CardHeader className="flex-row items-center justify-between bg-amber-50/50">
            <CardTitle className="flex items-center gap-2">Estimates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {estimates.map((est: any) => (
              <div
                key={est._id}
                className="rounded-lg border border-line-soft p-3 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-ink">
                      {est.invoiceNumber ?? `EST-temp-${est._id.slice(-4)}`}
                    </span>
                    <Badge
                      variant={
                        est.status === "approved"
                          ? "success"
                          : est.status === "rejected"
                            ? "destructive"
                            : est.status === "converted"
                              ? "secondary"
                              : "warning"
                      }
                    >
                      {est.status ?? (est.approved ? "approved" : "draft")}
                    </Badge>
                    {est.locked && <Badge variant="destructive">LOCKED</Badge>}
                  </div>
                  <span className="text-[12px] text-mute">
                    {formatNaira(est.grandTotal)} ·{" "}
                    {est.approved ? "Approved" : "Draft"}
                  </span>
                </div>
                <div className="text-[12px] text-mute">
                  Parts {formatNaira(est.partsTotal)} · Labour{" "}
                  {formatNaira(est.labourTotal)} · VAT {formatNaira(est.vat)}
                </div>
                {est.rejectedReason && (
                  <p className="text-[12px] text-rose-600">
                    Reason: {est.rejectedReason}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {est.status === "draft" && canApproveEstimate && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          approveEstimate.mutate(
                            { invoiceId: est._id },
                            {
                              onSuccess: () => {
                                toast.success("Estimate approved.");
                                invalidate();
                              },
                              onError: (e: any) => toast.error(e.message),
                            },
                          )
                        }
                      >
                        Approve
                      </Button>
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="Reject reason"
                          value={rejectReasons[est._id] ?? ""}
                          onChange={(e) =>
                            setRejectReasons((current) => ({
                              ...current,
                              [est._id]: e.target.value,
                            }))
                          }
                          className="h-8 w-40"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600"
                          onClick={() =>
                            rejectEstimate.mutate(
                              {
                                invoiceId: est._id,
                                reason: rejectReasons[est._id] ?? "",
                              },
                              {
                                onSuccess: () => {
                                  toast.success("Estimate rejected.");
                                  setRejectReasons((current) => {
                                    const next = { ...current };
                                    delete next[est._id];
                                    return next;
                                  });
                                  invalidate();
                                },
                                onError: (e: any) => toast.error(e.message),
                              },
                            )
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {canCsrEstimate && !draftEstimate && hasItems && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  createEstimate.mutate(
                    { jobId: jobId as Id<"jobs">, domain: "service" },
                    {
                      onSuccess: () => {
                        toast.success("Estimate created.");
                        invalidate();
                      },
                      onError: (e: any) => toast.error(e.message),
                    },
                  )
                }
              >
                Generate Estimate from Job Items
              </Button>
            )}
            {canCsrEstimate && !draftEstimate && !showManualEstimate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowManualEstimate(true)}
              >
                Input Manual Estimate
              </Button>
            )}
            {manualEstimateForm}
          </CardContent>
        </Card>
      )}

      {/* No estimate yet but allow CSR to create */}
      {estimates.length === 0 && canCsrEstimate && (
        <Card className="border-dashed">
          <CardContent className="pt-4 flex gap-2">
            {hasItems && (
              <Button
                size="sm"
                onClick={() =>
                  createEstimate.mutate(
                    { jobId: jobId as Id<"jobs">, domain: "service" },
                    {
                      onSuccess: () => {
                        toast.success("Estimate created.");
                        invalidate();
                      },
                      onError: (e: any) => toast.error(e.message),
                    },
                  )
                }
              >
                Create Estimate
              </Button>
            )}
            {!showManualEstimate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowManualEstimate(true)}
              >
                Input Manual Estimate
              </Button>
            )}
            {manualEstimateForm}
          </CardContent>
        </Card>
      )}

      {/* Final invoice section */}
      {finalInvoice ? (
        <Card
          className={`overflow-hidden ${finalInvoice.locked ? "border-emerald-300" : ""}`}
        >
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Invoice</CardTitle>
              {finalInvoice.locked && (
                <Badge
                  variant="success"
                  className="bg-emerald-100 text-emerald-800 border-emerald-200"
                >
                  LOCKED
                </Badge>
              )}
              {finalInvoice.invoiceNumber && (
                <span className="font-mono text-xs font-bold text-mute">
                  {finalInvoice.invoiceNumber}
                </span>
              )}
            </div>
            <PrintableInvoice
              invoice={finalInvoice}
              job={job}
              customer={customer}
              vehicle={vehicle}
              payments={payments}
            />
          </CardHeader>
          {finalInvoice.locked && (
            <div className="mx-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-[12px] font-semibold text-emerald-800">
              🔒 Locked — final invoice approved. Only Admin can unlock with
              reason.
            </div>
          )}
          <CardContent className="space-y-4 pt-4">
            <div className="overflow-hidden rounded-[10px] border border-line-soft">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalInvoice.lineItems.map((li: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="text-body">
                        {li.description}
                      </TableCell>
                      <TableCell className="[font-variant-numeric:tabular-nums]">
                        {li.qty}
                      </TableCell>
                      <TableCell className="text-right [font-variant-numeric:tabular-nums]">
                        {formatNaira(li.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-ink [font-variant-numeric:tabular-nums]">
                        {formatNaira(li.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="ml-auto w-full max-w-xs space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-mute">Parts total</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(finalInvoice.partsTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Labour total</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(finalInvoice.labourTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Subtotal</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(finalInvoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">VAT</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(finalInvoice.vat)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 text-sm font-extrabold text-ink">
                <span>Grand total</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(finalInvoice.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Paid</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(finalInvoice.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-ink">
                <span>Balance</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {formatNaira(
                    finalInvoice.grandTotal - finalInvoice.amountPaid,
                  )}
                </span>
              </div>
            </div>
            {isAdmin &&
              (finalInvoice.generatedById ||
                finalInvoice.generationHistory?.length > 0) && (
                <div className="space-y-1 text-[11px] text-mute">
                  {finalInvoice.generatedById && (
                    <p>
                      Generated by:{" "}
                      <span className="font-mono text-body">
                        {String(finalInvoice.generatedById).slice(-6)}
                      </span>{" "}
                      {finalInvoice.approvedTs
                        ? `· ${formatDateTime(finalInvoice.approvedTs)}`
                        : ""}
                    </p>
                  )}
                  {finalInvoice.generationHistory?.length > 0 && (
                    <div className="space-y-0.5 border-l-2 border-line-soft pl-2">
                      {finalInvoice.generationHistory.map(
                        (entry: any, index: number) => (
                          <p key={`${entry.ts}-${index}`}>
                            {entry.action === "generated"
                              ? "Generated"
                              : "Regenerated"}{" "}
                            by{" "}
                            <span className="text-body">
                              {entry.user?.name ||
                                entry.user?.email ||
                                "Unknown user"}
                            </span>{" "}
                            · {formatDateTime(entry.ts)}
                          </p>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            {canFinance && (
              <div className="flex flex-wrap gap-2 pt-2">
                {!finalInvoice.approved && (
                  <Button
                    onClick={() =>
                      approve.mutate(
                        { invoiceId: finalInvoice._id },
                        {
                          onSuccess: () => {
                            toast.success("Invoice approved & locked.");
                            invalidate();
                          },
                          onError: (e: any) => toast.error(e.message),
                        },
                      )
                    }
                    disabled={approve.isPending}
                  >
                    {approve.isPending
                      ? "Approving..."
                      : "Approve Invoice (will lock)"}
                  </Button>
                )}
                {!finalInvoice.locked && !finalInvoice.paid && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      regenerate.mutate(
                        { jobId: jobId as Id<"jobs"> },
                        {
                          onSuccess: () => {
                            toast.success("Invoice regenerated.");
                            void queryClient.invalidateQueries({
                              queryKey:
                                invoiceQueries.listByJob(jobId).queryKey,
                            });
                          },
                          onError: (e: any) => toast.error(e.message),
                        },
                      )
                    }
                    disabled={regenerate.isPending}
                  >
                    {regenerate.isPending
                      ? "Regenerating..."
                      : "Regenerate Invoice"}
                  </Button>
                )}
              </div>
            )}
            {isAdmin &&
              finalInvoice.locked &&
              finalInvoice.amountPaid === 0 &&
              !finalInvoice.paid && (
                <div className="flex items-end gap-2 border-t border-line-soft pt-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">
                      Unlock reason (admin, ≥10 chars)
                    </Label>
                    <Input
                      placeholder="Reason for unlocking..."
                      value={unlockReason}
                      onChange={(e) => setUnlockReason(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="text-amber-700"
                    onClick={() =>
                      adminUnlock.mutate(
                        { invoiceId: finalInvoice._id, reason: unlockReason },
                        {
                          onSuccess: () => {
                            toast.success("Invoice unlocked.");
                            setUnlockReason("");
                            invalidate();
                          },
                          onError: (e: any) => toast.error(e.message),
                        },
                      )
                    }
                  >
                    Unlock
                  </Button>
                </div>
              )}
            {canFinance &&
              finalInvoice.approved &&
              finalInvoice.grandTotal - finalInvoice.amountPaid > 0 && (
                <div className="flex items-end gap-3 border-t border-line-soft pt-4">
                  <div className="w-44 space-y-2">
                    <Label htmlFor="method">Method</Label>
                    <Select
                      id="method"
                      value={method}
                      onChange={(e) => setMethod(e.target.value as any)}
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      <option value="card">Card</option>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      const bal =
                        finalInvoice.grandTotal - finalInvoice.amountPaid;
                      recordPayment.mutate(
                        {
                          invoiceId: finalInvoice._id,
                          amount: bal,
                          method: method as any,
                        },
                        {
                          onSuccess: () => {
                            toast.success("Payment recorded.");
                            invalidate();
                          },
                          onError: (e: any) => toast.error(e.message),
                        },
                      );
                    }}
                    disabled={recordPayment.isPending}
                  >
                    {recordPayment.isPending
                      ? "Recording..."
                      : `Record Full Payment (${formatNaira(finalInvoice.grandTotal - finalInvoice.amountPaid)})`}
                  </Button>
                </div>
              )}
            {payments.length > 0 && (
              <div className="border-t border-line-soft pt-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-mute">
                  Payment history
                </p>
                <div className="space-y-1">
                  {payments.map((pmt: any) => (
                    <div
                      key={pmt._id}
                      className="flex justify-between text-[13px]"
                    >
                      <span className="text-body">
                        {formatDateTime(pmt.ts)} ·{" "}
                        <span className="capitalize">{pmt.method}</span>
                      </span>
                      <span className="font-bold text-ink [font-variant-numeric:tabular-nums]">
                        {formatNaira(pmt.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        canFinance &&
        hasItems && (
          <Card>
            <CardContent className="pt-4">
              <Button
                onClick={() =>
                  generate.mutate(
                    { jobId: jobId as Id<"jobs"> },
                    {
                      onSuccess: () => {
                        toast.success("Final invoice generated.");
                        invalidate();
                      },
                      onError: (e: any) => toast.error(e.message),
                    },
                  )
                }
                disabled={generate.isPending}
              >
                {generate.isPending
                  ? "Generating..."
                  : "Generate Final Invoice"}
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

function MarkPaidButton({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const markPaid = useMarkPaidMutation();

  return (
    <Card>
      <CardContent className="pt-[18px]">
        <Button
          onClick={() =>
            markPaid.mutate(
              { jobId: jobId as Id<"jobs"> },
              {
                onSuccess: () => {
                  toast.success("Job marked as paid.");
                  void queryClient.invalidateQueries();
                },
              },
            )
          }
          disabled={markPaid.isPending}
        >
          {markPaid.isPending ? "Updating..." : "Mark Job as Paid"}
        </Button>
      </CardContent>
    </Card>
  );
}
