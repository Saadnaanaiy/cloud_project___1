import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

import React from 'react'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => React.createElement('div', props, children),
    h1: ({ children, ...props }: Record<string, unknown>) => React.createElement('h1', props, children),
  },
}))
