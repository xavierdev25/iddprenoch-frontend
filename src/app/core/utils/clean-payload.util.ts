/**
 * Reactive forms default untouched optional text fields to `''`, but the backend's zod schemas
 * treat '' as "present but invalid" for format-validated optional fields (email, url) — not as
 * "absent". Call this on the payload right before `create`/`update` so an empty field is sent as
 * absent instead of ''.
 */
export function stripEmptyStrings<T extends Record<string, unknown>>(data: T): T {
  const cleaned = { ...data };
  for (const key of Object.keys(cleaned) as (keyof T)[]) {
    if (cleaned[key] === '') {
      cleaned[key] = undefined as T[keyof T];
    }
  }
  return cleaned;
}
