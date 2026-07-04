import { HttpErrorResponse } from '@angular/common/http';

const FALLBACK_MESSAGE = 'Ocurrió un error. Intenta de nuevo.';

/** Reads the `{ error: { message } }` shape the backend's error middleware always returns. */
export function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return err.error?.error?.message ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}
