import { describe, it, expect } from 'vitest'
import { translations } from '../context/translations'

describe('translations', () => {
  it('has all keys in French', () => {
    const enKeys = Object.keys(translations.en)
    const frKeys = Object.keys(translations.fr)
    expect(frKeys.sort()).toEqual(enKeys.sort())
  })

  it('has all keys in Arabic', () => {
    const enKeys = Object.keys(translations.en)
    const arKeys = Object.keys(translations.ar)
    expect(arKeys.sort()).toEqual(enKeys.sort())
  })

  it('returns the correct English value for a key', () => {
    expect(translations.en.dashboard).toBe('Dashboard')
    expect(translations.en.logout).toBe('Logout')
    expect(translations.en.signIn).toBe('Sign In')
  })

  it('returns the correct French value', () => {
    expect(translations.fr.dashboard).toBe('Tableau de bord')
    expect(translations.fr.logout).toBe('Déconnexion')
  })

  it('returns the correct Arabic value', () => {
    expect(translations.ar.dashboard).toBe('لوحة القيادة')
    expect(translations.ar.logout).toBe('تسجيل خروج')
  })
})
