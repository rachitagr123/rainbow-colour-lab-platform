import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { loginIdToEmail, supabase } from './supabase'
import type { Profile } from './types'

interface AuthState {
  loading: boolean
  session: Session | null
  profile: Profile | null
  isAdmin: boolean
  signIn: (loginId: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, role, approved, full_name')
    .eq('id', userId)
    .maybeSingle()
  return (data as Profile | null) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let active = true

    const apply = async (next: Session | null) => {
      const nextProfile = next ? await fetchProfile(next.user.id) : null
      if (!active) return
      setSession(next)
      setProfile(nextProfile)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => apply(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Defer: calling Supabase inside this callback can deadlock the auth client.
        setTimeout(() => apply(next), 0)
      } else {
        setSession(next)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (loginId: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: loginIdToEmail(loginId), password })
    if (error) return error.message === 'Invalid login credentials' ? 'Wrong login ID or password.' : error.message
    return null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{ loading, session, profile, isAdmin: profile?.role === 'admin' && profile.approved, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
