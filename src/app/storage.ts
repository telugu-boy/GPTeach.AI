import type { Middleware } from '@reduxjs/toolkit'

const PERSIST_KEYS = ['templates', 'plans', 'classes'] as const
const STORAGE_KEY = 'lesson_planner_state_v1'

function load(): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function save(state: any) {
  try {
    const snapshot: Record<string, unknown> = {}
    for (const key of PERSIST_KEYS) {
      snapshot[key] = state[key]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {}
}

export const preloadedState = load()

export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()
  save(state)
  return result
}