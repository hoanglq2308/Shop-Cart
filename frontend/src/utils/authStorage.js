const ACCOUNTS_KEY = 'shopcart.accounts'
const CURRENT_USER_KEY = 'shopcart.currentUserEmail'

function readJson(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (_error) {
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadAccounts() {
  return readJson(ACCOUNTS_KEY, [])
}

export function saveAccounts(accounts) {
  writeJson(ACCOUNTS_KEY, accounts)
}

export function loadCurrentUserEmail() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(CURRENT_USER_KEY)
}

export function saveCurrentUserEmail(email) {
  if (typeof window === 'undefined') {
    return
  }

  if (email) {
    window.localStorage.setItem(CURRENT_USER_KEY, email)
    return
  }

  window.localStorage.removeItem(CURRENT_USER_KEY)
}