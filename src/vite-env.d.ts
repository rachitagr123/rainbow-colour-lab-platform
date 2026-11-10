/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_ACCESS_KEY: string | undefined
  readonly VITE_SUPABASE_URL: string | undefined
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
