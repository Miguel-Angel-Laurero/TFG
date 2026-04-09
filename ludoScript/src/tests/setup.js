import { vi } from 'vitest'

// Mock vue-router to avoid navigation side-effects in tests
vi.mock('@/router/router', () => ({
  default: {
    push: vi.fn(),
  },
}))
