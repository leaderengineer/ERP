import { readFromStorage, writeToStorage } from './storage'

export const SPECIALIZATION_OPTIONS = [
  'Matematika',
  'Fizika',
  'Kompyuter grafikasi va dizayn',
  "Kompyuter grafikasi va dizayn O'.A",
  'Tarix',
  'Ona tili va adabiyot',
  'Ingliz tili',
  'Biologiya',
  'Kimyo',
  'Geografiya',
  'Dasturlash',
  'Raqamli texnologiyalar',
  'Axborot xavfsizligi',
  'Tikuvchilik',
  'Avtomobil',
  'Elektromontyor',
  'Oshpazlik',
  'Melioratsiya',
] as const

export type Specialization = (typeof SPECIALIZATION_OPTIONS)[number]

export type Teacher = {
  id: string
  fullName: string
  firstName?: string
  lastName?: string
  middleName?: string
  username: string
  phone?: string
  department?: string
  degree?: string
  specialization?: Specialization
  password: string
}

const KEY = 'teachers'

function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 10; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

const seed: Teacher[] = [
  { id: 't1', fullName: 'Aliyev Anvar', username: 'anvar', phone: '+998 90 123 45 67', department: 'Dasturiy injiniring', password: generatePassword() },
  { id: 't2', fullName: 'Qodirova Mohira', username: 'mohira', phone: '+998 93 765 43 21', department: 'Axborot xavfsizligi', password: generatePassword() },
]

export function listTeachers(): Teacher[] {
  const data = readFromStorage<Teacher[]>(KEY, seed)
  if (!localStorage.getItem(KEY)) writeToStorage(KEY, data)
  return data
}

function generateUsername(firstName: string, lastName: string, middleName?: string, excludeId?: string): string {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
  const first = normalize(firstName)
  const last = normalize(lastName)
  const middle = middleName ? normalize(middleName) : ''

  const maxLen = 8

  let base = ''
  if (first) {
    base = first
    if (base.length > maxLen) {
      base = first[0] + (middle ? middle[0] : '') + (last ? last[0] : '')
      base = base || first.slice(0, 2)
    }
  }

  if (!base) base = 'user'
  base = base.slice(0, maxLen)

  const all = listTeachers()
  let candidate = base
  let counter = 1

  while (all.some(t => t.id !== excludeId && t.username.toLowerCase() === candidate.toLowerCase())) {
    const suffix = counter.toString()
    const trimmed = base.slice(0, Math.max(1, maxLen - suffix.length))
    candidate = `${trimmed}${suffix}`.slice(0, maxLen)
    counter++
  }

  return candidate
}

function buildFullName(firstName?: string, lastName?: string, middleName?: string) {
  const parts = [firstName, lastName, middleName].filter(Boolean)
  return parts.join(' ').trim()
}

export function createTeacher(input: Omit<Teacher, 'id' | 'password' | 'username' | 'fullName'> & { firstName?: string; lastName?: string; middleName?: string }): Teacher {
  const all = listTeachers()
  const fullName = buildFullName(input.firstName, input.lastName, input.middleName)
  const username = generateUsername(input.firstName || '', input.lastName || '', input.middleName, undefined)

  const created: Teacher = {
    ...input,
    fullName: fullName || username,
    username,
    id: crypto.randomUUID(),
    password: generatePassword(),
  }
  writeToStorage(KEY, [created, ...all])
  return created
}

export function updateTeacher(id: string, patch: Partial<Omit<Teacher, 'id'>>): Teacher | null {
  const all = listTeachers()
  const idx = all.findIndex(t => t.id === id)
  if (idx === -1) return null

  const current = all[idx]
  const updated = { ...current, ...patch }

  if (patch.firstName !== undefined || patch.lastName !== undefined || patch.middleName !== undefined) {
    updated.fullName = buildFullName(updated.firstName, updated.lastName, updated.middleName) || current.fullName
    updated.username = generateUsername(updated.firstName || '', updated.lastName || '', updated.middleName, id)
  }

  all[idx] = updated
  writeToStorage(KEY, all)
  return updated
}

export function deleteTeacher(id: string) {
  const all = listTeachers().filter(t => t.id !== id)
  writeToStorage(KEY, all)
}

export function getTeacherPassword(id: string): string | null {
  const t = listTeachers().find(t => t.id === id)
  return t ? t.password : null
}

export function authenticateTeacher(username: string, password: string): Teacher | null {
  const norm = (s: string) => s.trim().toLowerCase()
  const t = listTeachers().find(t => norm(t.username) === norm(username))
  if (t && t.password === password) return t
  return null
}


