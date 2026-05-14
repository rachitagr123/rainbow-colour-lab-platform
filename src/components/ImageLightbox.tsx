import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react'

type LightboxContextValue = {
  open: (url: string) => void
  close: () => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState<string | null>(null)

  const open = useCallback((next: string) => setUrl(next), [])
  const close = useCallback(() => setUrl(null), [])

  useEffect(() => {
    if (!url) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [url, close])

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}
      {url ? (
        <div
          className="lightbox-backdrop"
          role="presentation"
          onClick={close}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <button type="button" className="lightbox-close" aria-label="Close enlarged image" onClick={close}>
            ×
          </button>
          <img
            src={url}
            alt=""
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </LightboxContext.Provider>
  )
}

function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext)
  if (!ctx) {
    throw new Error('ZoomableImage must be used inside LightboxProvider')
  }
  return ctx
}

/** Click once to view full size in the lightbox. */
export function ZoomableImage({
  onClick,
  onKeyDown,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const { open } = useLightbox()
  const src = props.src
  return (
    <img
      {...props}
      className={[props.className, 'zoomable-img'].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      title={props.title ?? 'Click to enlarge'}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented && typeof src === 'string' && src.length > 0) {
          open(src)
        }
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || typeof src !== 'string' || src.length === 0) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open(src)
        }
      }}
    />
  )
}
