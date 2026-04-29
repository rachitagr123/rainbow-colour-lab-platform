import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '',
    json: async () => ({}),
  }),
  writable: true,
})
