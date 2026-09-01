import { z } from "zod";

/**
 * Convert a Zod schema into a Formik `validate` function.
 * Returns an errors object keyed by field name, preserving Formik
 * semantics (empty object = valid, populated = invalid).
 * Handles both top-level and nested path errors.
 */
export function zodToFormikValidate<T extends z.ZodTypeAny>(schema: T) {
  return (values: unknown): Record<string, string> => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!path) continue;
      // Only keep the first error per field to avoid overriding
      if (!(path in errors)) errors[path] = issue.message;
      // Also expose the leaf key for flat Formik forms (e.g. "name" from "user.name")
      const leaf = issue.path[issue.path.length - 1] as string | undefined;
      if (leaf && !(leaf in errors)) errors[leaf] = issue.message;
    }
    // Handle superRefine / form-level errors with empty path
    const formLevel = result.error.issues.find((i) => i.path.length === 0);
    if (formLevel && !("_form" in errors)) errors["_form"] = formLevel.message;
    return errors;
  };
}

/**
 * Small helper to render an inline field error coming from Formik.
 * Preserves the project's existing red / muted styling conventions.
 */
export function FieldError({
  touched,
  error,
}: {
  touched?: boolean;
  error?: string;
}) {
  if (!touched || !error) return null;
  return <p className="mt-1 text-[11.5px] font-medium text-rose-600">{error}</p>;
}

/**
 * Derive a human-readable error string from Convex / generic errors.
 * Preserves existing toast patterns.
 */
export function getErrorMessage(err: unknown, fallback = "Failed"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  const data = (err as any)?.data?.message ?? (err as any)?.message;
  if (typeof data === "string" && data.length > 0) return data;
  return fallback;
}
