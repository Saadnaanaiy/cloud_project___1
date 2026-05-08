import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import App from '../App'

beforeAll(() => {
  vi.stubGlobal('import', { meta: { env: { VITE_API_URL: '/api' } } })
})

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}))

vi.mock('../api/axios', () => ({
  default: {
    defaults: { headers: { common: {} } },
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => ({
    user: null,
    token: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    isAuthenticated: false,
    isInitializing: false,
  }),
}))

vi.mock('../context/LanguageContext', () => ({
  LanguageProvider: ({ children }: any) => <>{children}</>,
  useLang: () => ({
    t: (key: string) => key,
    dir: 'ltr' as const,
    lang: 'en' as const,
  }),
}))

vi.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }: any) => <>{children}</>,
}))

describe('App', () => {
  it('renders login page at /login', () => {
    window.history.pushState({}, '', '/login')
    render(<App />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders 404 page for unknown routes', () => {
    window.history.pushState({}, '', '/nonexistent')
    render(<App />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
