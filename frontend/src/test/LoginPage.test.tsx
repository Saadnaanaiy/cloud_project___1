import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../pages/LoginPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}))

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => <div data-testid="turnstile" />,
}))

process.env.VITE_TURNSTILE_SITE_KEY = '1'

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

describe('LoginPage', () => {
  it('renders the welcome heading', () => {
    renderPage()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders email input', () => {
    renderPage()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('renders password input', () => {
    renderPage()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderPage()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders a link to signup', () => {
    renderPage()
    expect(screen.getByText('Create an account')).toBeInTheDocument()
  })

  it('renders Turnstile CAPTCHA', () => {
    renderPage()
    expect(screen.getByTestId('turnstile')).toBeInTheDocument()
  })
})
