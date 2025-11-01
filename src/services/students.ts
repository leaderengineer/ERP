import { readFromStorage, writeToStorage } from './storage'

export const COURSE_OPTIONS = ['1-kurs', '2-kurs'] as const
export const EDUCATION_FORM_OPTIONS = ['Kunduzgi', 'Dual'] as const
export const PROGRAM_OPTIONS = [
  'Tikuvchilik',
  'Tikuv mahsulotlari dizayneri',
  'Raqamli axborotlar',
  'Kompyuter grafikasi',
  'Melioratsiya',
  'Avtomobil',
  'Oshpazlik',
  'Sotuv-nazorat kassiri',
  'Elektromontyor',
] as const

export type Course = typeof COURSE_OPTIONS[number]
export type EducationForm = typeof EDUCATION_FORM_OPTIONS[number]
export type Program = typeof PROGRAM_OPTIONS[number]

export const FIRST_COURSE_GROUPS = Array.from({ length: 24 }, (_, idx) => `${idx + 1}-26`)
export const SECOND_COURSE_GROUPS = Array.from({ length: 24 }, (_, idx) => `${idx + 1}-25`)
export const GROUPS_BY_COURSE: Record<Course, string[]> = {
  '1-kurs': FIRST_COURSE_GROUPS,
  '2-kurs': SECOND_COURSE_GROUPS,
}

export type Student = {
  id: string
  fullName: string
  firstName?: string
  lastName?: string
  course?: Course
  educationForm?: EducationForm
  program?: Program
  group?: string
}

const KEY = 'students'

const seed: Student[] = [
  { id: 's1', fullName: 'Mohira Qahhorova', course: '1-kurs', educationForm: 'Kunduzgi', program: 'Kompyuter grafikasi', group: '5-26' },
  { id: 's2', fullName: 'Jahongir Ismoilov', course: '2-kurs', educationForm: 'Dual', program: 'Tikuvchilik', group: '12-25' },
]

export function listStudents(): Student[] {
  const data = readFromStorage<Student[]>(KEY, seed)
  if (!localStorage.getItem(KEY)) writeToStorage(KEY, data)
  return data
}

export function createStudent(input: Omit<Student, 'id'>): Student {
  const all = listStudents()
  const created = { ...input, id: crypto.randomUUID() }
  writeToStorage(KEY, [created, ...all])
  return created
}

export function updateStudent(id: string, patch: Partial<Omit<Student, 'id'>>): Student | null {
  const all = listStudents()
  const idx = all.findIndex(s => s.id === id)
  if (idx === -1) return null
  const updated = { ...all[idx], ...patch }
  all[idx] = updated
  writeToStorage(KEY, all)
  return updated
}

export function deleteStudent(id: string) {
  const all = listStudents().filter(s => s.id !== id)
  writeToStorage(KEY, all)
}


