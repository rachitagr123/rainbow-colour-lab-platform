import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigured = Boolean(url && key)

export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true },
})

/** Login IDs like "admin" map to Supabase auth emails on this domain. */
export const LOGIN_DOMAIN = 'rainbowcolourlabs.com'

export function loginIdToEmail(id: string) {
  const trimmed = id.trim().toLowerCase()
  return trimmed.includes('@') ? trimmed : `${trimmed}@${LOGIN_DOMAIN}`
}

export function errorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Something went wrong. Please try again.'
}
