/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_ACCESS_KEY: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
