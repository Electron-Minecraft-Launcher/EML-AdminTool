import { fail as svelteFail } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

/**
 * Create an ActionFailure object. Call when form submission fails.
 * @param event The request event.
 * @param status The [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#client_error_responses). Must be in the range 400-599.
 * @param data Data associated with the failure (e.g. validation errors).
 */
export function fail(event: RequestEvent, status: number, data?: Record<string, unknown>): ReturnType<typeof svelteFail> {
  event.locals.logStatus = status

  return svelteFail(status, data ?? {})
}



