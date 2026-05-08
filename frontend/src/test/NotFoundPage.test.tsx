import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import NotFoundPage from '../pages/NotFoundPage'

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}))

const renderPage = () =>
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  )

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    renderPage()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders "Page Not Found" title', () => {
    renderPage()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('renders Go Back button', () => {
    renderPage()
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  it('renders Return Home button', () => {
    renderPage()
    expect(screen.getByText('Return Home')).toBeInTheDocument()
  })
})
