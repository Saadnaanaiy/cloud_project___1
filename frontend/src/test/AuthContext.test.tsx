import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

const store: Record<string, string> = {}
const mockStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  get length() { return Object.keys(store).length },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  key: (i: number) => Object.keys(store)[i] ?? null,
}
vi.stubGlobal('localStorage', mockStorage)

const mockPost = vi.fn()
vi.mock('../api/axios', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
    defaults: { headers: { common: {} } },
    get: vi.fn(),
  },
}))

import { AuthProvider, useAuth } from '../context/AuthContext'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children)

describe('AuthContext', () => {
  beforeEach(() => {
    delete store.token
    delete store.user
    vi.clearAllMocks()
  })

  it('starts with no user and not authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('login sets user and token', async () => {
    const userData = { id: 1, name: 'Test', email: 'test@test.com', role: 'admin' }
    mockPost.mockResolvedValue({ data: { access_token: 'tok', user: userData } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@test.com', 'pass', 'captcha')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('tok')
    expect(result.current.user).toEqual(userData)
    expect(store.token).toBe('tok')
  })

  it('logout clears user and token', () => {
    store.token = 'tok'
    store.user = JSON.stringify({ id: 1, name: 'T', email: 't@t.com', role: 'admin' })

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
    expect(result.current.user).toBeNull()
    expect(store.token).toBeUndefined()
  })
})
