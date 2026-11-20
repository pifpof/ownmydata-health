import type { Result } from '@shared/ipc-contract'

export const api = window.api

/** Unwraps a Result, throwing its plain-English message on failure. */
export async function call<T>(p: Promise<Result<T>>): Promise<T> {
  const r = await p
  if (!r.ok) throw new Error(r.error.message)
  return r.data
}
