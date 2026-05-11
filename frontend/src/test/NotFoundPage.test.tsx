import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect } from 'vitest'
import NotFoundPage from '../pages/NotFoundPage'

const renderPage = () =>
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  )

describe('NotFoundPage', () => {
  test.each([
    ['404 heading', '404'],
    ['"Page Not Found" title', 'Page Not Found'],
    ['Go Back button', 'Go Back'],
    ['Return Home button', 'Return Home'],
  ])('renders %s', (_, text) => {
    renderPage()
    expect(screen.getByText(text)).toBeInTheDocument()
  })
})
