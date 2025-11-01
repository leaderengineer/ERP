export function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}


