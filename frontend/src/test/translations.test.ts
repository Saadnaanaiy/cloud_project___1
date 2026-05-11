import { describe, it, expect } from 'vitest'
import { translations } from '../context/translations'

function expectMatchingKeys(lang: 'fr' | 'ar') {
  const enKeys = Object.keys(translations.en).toSorted((a, b) => a.localeCompare(b))
  const langKeys = Object.keys(translations[lang]).toSorted((a, b) => a.localeCompare(b))
  expect(langKeys).toEqual(enKeys)
}

describe('translations', () => {
  it('has all keys in French', () => expectMatchingKeys('fr'))

  it('has all keys in Arabic', () => expectMatchingKeys('ar'))

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
