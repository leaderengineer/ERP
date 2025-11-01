import { readFromStorage, writeToStorage } from './storage'

export type LibraryItem = {
  id: string
  title: string
  author?: string
  url?: string
}

const KEY = 'library-items'

const seed: LibraryItem[] = [
  { id: 'l1', title: 'Algoritmlar asoslari', author: 'T. X', url: '#' },
  { id: 'l2', title: 'Web dasturlash', author: 'N. Y', url: '#' },
]

export function listLibrary(): LibraryItem[] {
  const data = readFromStorage<LibraryItem[]>(KEY, seed)
  if (!localStorage.getItem(KEY)) writeToStorage(KEY, data)
  return data
}

export function addLibraryItem(input: Omit<LibraryItem, 'id'>): LibraryItem {
  const all = listLibrary()
  const created = { ...input, id: crypto.randomUUID() }
  writeToStorage(KEY, [created, ...all])
  return created
}

export function removeLibraryItem(id: string) {
  const all = listLibrary().filter(i => i.id !== id)
  writeToStorage(KEY, all)
}


