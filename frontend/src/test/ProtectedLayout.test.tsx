import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

const mockUseAuth = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))
vi.mock('../context/LanguageContext', () => ({
  useLang: () => ({
    t: (key: string) => key,
    dir: 'ltr' as const,
    lang: 'en' as const,
    setLang: vi.fn(),
  }),
}))
vi.mock('../context/ChatContext', () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
  useChat: () => ({ unreadTotal: 0, contacts: [], messages: [], sendMessage: vi.fn(), deleteMessage: vi.fn() }),
}))
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

import ProtectedLayout from '../components/ProtectedLayout'

describe('ProtectedLayout', () => {
  const renderLayout = () =>
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

  it('shows loading spinner when initializing', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isInitializing: true })
    renderLayout()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isInitializing: false })
    renderLayout()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
      user: { id: 1, name: 'Test', email: 't@t.com', role: 'admin' },
    })
    renderLayout()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })
})
