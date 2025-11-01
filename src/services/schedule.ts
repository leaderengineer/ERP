import { readFromStorage, writeToStorage } from './storage'

export const DAY_OPTIONS = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'] as const
export type Day = (typeof DAY_OPTIONS)[number]

export const PERIOD_OPTIONS = [1, 2, 3, 4, 5, 6] as const
export type Period = (typeof PERIOD_OPTIONS)[number]

export const PERIOD_TIME_MAP: Record<Period, string> = {
  1: '08:30-09:50',
  2: '10:00-11:20',
  3: '11:30-12:50',
  4: '13:00-14:20',
  5: '14:30-15:50',
  6: '16:00-17:20',
}

const PERIOD_BY_TIME = Object.fromEntries(
  Object.entries(PERIOD_TIME_MAP).map(([period, time]) => [time, Number(period) as Period]),
)

export type Lesson = {
  id: string
  day: Day
  period: Period
  suratSubject: string
  maxrajSubject?: string
  room?: string
  suratTeacherId?: string
  maxrajTeacherId?: string
}

const KEY = 'schedule-lessons'

const seed: Lesson[] = [
  { id: 'l1', day: 'Dush', period: 1, suratSubject: 'Matematika', maxrajSubject: 'Tarix', room: 'A-101' },
  { id: 'l2', day: 'Sesh', period: 2, suratSubject: 'Dasturlash', room: 'B-203' },
]

function normalizeLesson(raw: any): Lesson | null {
  if (!raw) return null
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : crypto.randomUUID()
  const dayValue = typeof raw.day === 'string' && DAY_OPTIONS.includes(raw.day as Day) ? (raw.day as Day) : DAY_OPTIONS[0]
  const period = resolvePeriod(raw)
  const suratSubjectValue = extractSubject(raw.suratSubject ?? raw.subject)
  if (!suratSubjectValue) return null
  const maxrajSubjectValue = extractSubject(raw.maxrajSubject)
  const roomValue = typeof raw.room === 'string' && raw.room.trim() ? raw.room.trim() : undefined
  const suratTeacherIdValue = typeof raw.suratTeacherId === 'string' && raw.suratTeacherId.trim() ? raw.suratTeacherId.trim() : undefined
  const maxrajTeacherIdValue = typeof raw.maxrajTeacherId === 'string' && raw.maxrajTeacherId.trim() ? raw.maxrajTeacherId.trim() : undefined
  return {
    id,
    day: dayValue,
    period,
    suratSubject: suratSubjectValue,
    maxrajSubject: maxrajSubjectValue,
    room: roomValue,
    suratTeacherId: suratTeacherIdValue,
    maxrajTeacherId: maxrajTeacherIdValue,
  }
}

function resolvePeriod(raw: any): Period {
  const numeric = normalizeToNumber(raw.period)
  if (numeric && PERIOD_OPTIONS.includes(numeric as Period)) return numeric as Period
  if (typeof raw.time === 'string' && PERIOD_BY_TIME[raw.time]) return PERIOD_BY_TIME[raw.time]
  return PERIOD_OPTIONS[0]
}

function normalizeToNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const num = Number(value)
    if (!Number.isNaN(num)) return num
  }
  return undefined
}

function extractSubject(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function listLessons(): Lesson[] {
  const stored = readFromStorage<unknown[]>(KEY, seed)
  const normalized = stored
    .map(normalizeLesson)
    .filter((lesson): lesson is Lesson => Boolean(lesson))
  writeToStorage(KEY, normalized)
  return normalized
}

export function addLesson(input: Omit<Lesson, 'id'>): Lesson {
  const all = listLessons()
  const idx = all.findIndex(l => l.day === input.day && l.period === input.period)
  if (idx !== -1) {
    const existing = all[idx]
    const updated: Lesson = {
      ...existing,
      ...input,
      id: existing.id,
      maxrajSubject: input.maxrajSubject,
    }
    all[idx] = updated
    writeToStorage(KEY, all)
    return updated
  }
  const created: Lesson = { ...input, id: crypto.randomUUID() }
  writeToStorage(KEY, [created, ...all])
  return created
}

export function updateLesson(id: string, patch: Partial<Omit<Lesson, 'id'>>): Lesson | null {
  const all = listLessons()
  const idx = all.findIndex(l => l.id === id)
  if (idx === -1) return null
  const updated: Lesson = {
    ...all[idx],
    ...patch,
    suratSubject: patch.suratSubject ?? all[idx].suratSubject,
  }
  all[idx] = updated
  writeToStorage(KEY, all)
  return updated
}

export function removeLesson(id: string) {
  const left = listLessons().filter(l => l.id !== id)
  writeToStorage(KEY, left)
}


