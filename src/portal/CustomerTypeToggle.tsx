import { CUSTOMER_TYPE_LABEL, type CustomerType } from './types'

export function CustomerTypeToggle({
  value,
  onChange,
}: {
  value: CustomerType | ''
  onChange: (t: CustomerType) => void
}) {
  return (
    <div className="p-toggle" role="radiogroup" aria-label="Customer type">
      {(Object.keys(CUSTOMER_TYPE_LABEL) as CustomerType[]).map((t) => (
        <button
          type="button"
          key={t}
          role="radio"
          aria-checked={value === t}
          className={value === t ? 'is-active' : ''}
          onClick={() => onChange(t)}
        >
          {CUSTOMER_TYPE_LABEL[t]}
        </button>
      ))}
    </div>
  )
}

export function CustomerTypeTag({ type }: { type: CustomerType }) {
  return <span className={`p-ctype p-ctype--${type}`}>{CUSTOMER_TYPE_LABEL[type]}</span>
}
