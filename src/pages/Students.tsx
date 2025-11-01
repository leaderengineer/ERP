import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Card, Button, Input } from '../components/ui'
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  COURSE_OPTIONS,
  EDUCATION_FORM_OPTIONS,
  PROGRAM_OPTIONS,
  type Student,
  type Course,
  type EducationForm,
  type Program,
} from '../services/students'
import RoleGuard from '../components/RoleGuard'
import { toCsv, downloadCsv } from '../utils/csv'

type CourseOption = Course
type ProgramOption = Program
type EducationFormOption = EducationForm

const SELECT_CLASSNAME = 'w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 outline-none focus:ring-2 ring-primary/40'

const FIRST_COURSE_GROUPS = Array.from({ length: 24 }, (_, idx) => `${idx + 1}-26`)
const SECOND_COURSE_GROUPS = Array.from({ length: 24 }, (_, idx) => `${idx + 1}-25`)
const GROUPS_BY_COURSE: Record<CourseOption, string[]> = {
  '1-kurs': FIRST_COURSE_GROUPS,
  '2-kurs': SECOND_COURSE_GROUPS,
}
const ALL_GROUP_OPTIONS = Array.from(new Set([...FIRST_COURSE_GROUPS, ...SECOND_COURSE_GROUPS]))

type StudentFilters = {
  program: '' | ProgramOption
  educationForm: '' | EducationFormOption
  group: '' | string
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>(() => listStudents())
  const [query, setQuery] = useState('')
  const [studentFilters, setStudentFilters] = useState<StudentFilters>({
    program: '',
    educationForm: '',
    group: '',
  })
  const [form, setForm] = useState<Partial<Student>>(() => ({
    firstName: '',
    lastName: '',
    course: undefined,
    educationForm: undefined,
    program: undefined,
    group: undefined,
  }))
  const [editingId, setEditingId] = useState<string | null>(null)
  const availableGroups = useMemo(() => {
    if (!form.course) return []
    return GROUPS_BY_COURSE[form.course as CourseOption] ?? []
  }, [form.course])
  const filterGroupOptions = ALL_GROUP_OPTIONS
  const groupPlaceholder = form.course ? 'Guruhni tanlang' : 'Avval kursni tanlang'

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return students.filter(s => {
      const matchesQuery = (s.fullName || '').toLowerCase().includes(q)
      if (!matchesQuery) return false
      if (studentFilters.program && s.program !== studentFilters.program) return false
      if (studentFilters.educationForm && s.educationForm !== studentFilters.educationForm) return false
      if (studentFilters.group && s.group !== studentFilters.group) return false
      return true
    })
  }, [students, query, studentFilters.program, studentFilters.educationForm, studentFilters.group])

  function reset() {
    setForm({
      firstName: '',
      lastName: '',
      course: undefined,
      educationForm: undefined,
      program: undefined,
      group: undefined,
    })
    setEditingId(null)
  }

  function onSubmit() {
    if (!form.firstName?.trim() || !form.lastName?.trim()) return
    if (!form.course || !form.educationForm || !form.program || !form.group) return
    if (!availableGroups.includes(form.group)) return
    const firstName = form.firstName.trim()
    const lastName = form.lastName.trim()
    const fullName = `${firstName} ${lastName}`
    if (editingId) {
      const updated = updateStudent(editingId, {
        fullName,
        firstName,
        lastName,
        course: form.course,
        educationForm: form.educationForm,
        program: form.program,
        group: form.group,
      })
      if (updated) setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)))
    } else {
      const created = createStudent({
        fullName,
        firstName,
        lastName,
        course: form.course,
        educationForm: form.educationForm,
        program: form.program,
        group: form.group,
      })
      setStudents(prev => [created, ...prev])
    }
    reset()
  }

  function onEdit(s: Student) {
    setEditingId(s.id)
    const course = s.course
    const allowedGroups = course ? GROUPS_BY_COURSE[course as CourseOption] ?? [] : []
    setForm({
      firstName: s.firstName ?? '',
      lastName: s.lastName ?? '',
      course,
      educationForm: s.educationForm,
      program:
        s.program && PROGRAM_OPTIONS.includes(s.program as ProgramOption)
          ? (s.program as ProgramOption)
          : undefined,
      group: s.group && allowedGroups.includes(s.group) ? s.group : undefined,
    })
  }

  function onDelete(id: string) {
    deleteStudent(id)
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  function exportCsv() {
    const header = ['F.I.Sh', 'Yo‘nalish', 'Kurs', "Ta'lim shakli", 'Guruh']
    const rows = students.map(s => [s.fullName, s.program || '', s.course || '', s.educationForm || '', s.group || ''])
    downloadCsv('talabalar.csv', toCsv([header, ...rows]))
  }

  async function importCsv(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = text.split(/\r?\n/).map(r => r.split(','))
    const [header, ...data] = rows
    const nameIdx = header.findIndex(h => /fi|ism/i.test(h))
    const groupIdx = header.findIndex(h => /guruh|group/i.test(h))
    const courseIdx = header.findIndex(h => /kurs/i.test(h))
    const educationIdx = header.findIndex(h => /(ta'?lim|shakl|form)/i.test(h))
    const programIdx = header.findIndex(h => /yo'?nalish|program/i.test(h))
    if (nameIdx === -1) return
    const created: Student[] = []
    for (const r of data) {
      const fullName = r[nameIdx]?.trim()
      if (!fullName) continue
      const courseValue = courseIdx !== -1 ? r[courseIdx]?.trim() : undefined
      const educationValue = educationIdx !== -1 ? r[educationIdx]?.trim() : undefined
      const programValue = programIdx !== -1 ? r[programIdx]?.trim() : undefined
      const groupValue = groupIdx !== -1 ? r[groupIdx]?.trim() : undefined
      const courseText = courseValue?.toLowerCase()
      const normalisedCourse: Course | undefined = courseText === '2-kurs' ? '2-kurs' : courseText === '1-kurs' ? '1-kurs' : undefined
      const educationText = educationValue?.toLowerCase()
      const normalisedEducation: Student['educationForm'] | undefined =
        educationText === 'dual' ? 'Dual' : educationText === 'kunduzgi' ? 'Kunduzgi' : undefined
      const programText = programValue?.toLowerCase()
      const normalisedProgram: Program | undefined = programText
        ? (PROGRAM_OPTIONS.find(option => option.toLowerCase() === programText) as Program | undefined)
        : undefined
      const allowedGroups = normalisedCourse ? GROUPS_BY_COURSE[normalisedCourse] : []
      const normalisedGroup = groupValue && allowedGroups.includes(groupValue) ? groupValue : undefined
      if (!normalisedCourse || !normalisedEducation || !normalisedProgram || !normalisedGroup) continue
      const c = createStudent({
        fullName,
        course: normalisedCourse,
        educationForm: normalisedEducation,
        program: normalisedProgram,
        group: normalisedGroup,
      })
      created.push(c)
    }
    if (created.length) setStudents(prev => [...created, ...prev])
    e.currentTarget.value = ''
  }

  return (
    <div className="space-y-4">
      <RoleGuard allow={['admin']}>
        <Card className="text-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ism</label>
              <Input value={form.firstName || ''} onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Familiya</label>
              <Input value={form.lastName || ''} onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kurs</label>
              <select
                value={form.course ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    course: e.target.value ? (e.target.value as CourseOption) : undefined,
                    group: undefined,
                  }))
                }
                className={SELECT_CLASSNAME}
              >
                <option value="">Kursni tanlang</option>
                {COURSE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ta'lim shakli</label>
              <select
                value={form.educationForm ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    educationForm: e.target.value ? (e.target.value as Student['educationForm']) : undefined,
                  }))
                }
                className={SELECT_CLASSNAME}
              >
                <option value="">Ta'lim shaklini tanlang</option>
                {EDUCATION_FORM_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Yo‘nalish</label>
              <select
                value={form.program ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    program: e.target.value ? (e.target.value as ProgramOption) : undefined,
                  }))
                }
                className={SELECT_CLASSNAME}
              >
                <option value="">Yo'nalishni tanlang</option>
                {PROGRAM_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Guruh</label>
              <select
                value={form.group ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    group: e.target.value ? e.target.value : undefined,
                  }))
                }
                disabled={!form.course}
                className={`${SELECT_CLASSNAME} ${!form.course ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">{groupPlaceholder}</option>
                {availableGroups.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-6">
              <Button onClick={onSubmit}>{editingId ? 'Saqlash' : 'Qo‘shish'}</Button>
              {editingId && (
                <Button variant="outline" className="ml-2" onClick={reset}>Bekor qilish</Button>
              )}
            </div>
          </div>
        </Card>
      </RoleGuard>

      <Card className="text-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Qidirish</label>
            <Input placeholder="Ism bo‘yicha..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Yo‘nalish</label>
            <select
              value={studentFilters.program}
              onChange={e =>
                setStudentFilters(prev => ({
                  ...prev,
                  program: e.target.value as StudentFilters['program'],
                }))
              }
              className={SELECT_CLASSNAME}
            >
              <option value="">Barchasi</option>
              {PROGRAM_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Ta'lim shakli</label>
            <select
              value={studentFilters.educationForm}
              onChange={e =>
                setStudentFilters(prev => ({
                  ...prev,
                  educationForm: e.target.value as StudentFilters['educationForm'],
                }))
              }
              className={SELECT_CLASSNAME}
            >
              <option value="">Barchasi</option>
              {EDUCATION_FORM_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Guruh</label>
            <select
              value={studentFilters.group}
              onChange={e =>
                setStudentFilters(prev => ({
                  ...prev,
                  group: e.target.value as StudentFilters['group'],
                }))
              }
              className={SELECT_CLASSNAME}
            >
              <option value="">Barchasi</option>
              {filterGroupOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="flex justify-between p-3">
          <label className="text-sm text-gray-300">
            <span className="mr-2">CSV import</span>
            <input type="file" accept=".csv" onChange={importCsv} className="hidden" id="s-import" />
            <Button asChild variant="outline"><label htmlFor="s-import">Yuklash</label></Button>
          </label>
          <RoleGuard allow={['admin']}>
            <Button variant="outline" onClick={exportCsv}>CSV eksport</Button>
          </RoleGuard>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="text-left px-4 py-2">F.I.Sh</th>
              <th className="text-left px-4 py-2">Yo‘nalish</th>
              <th className="text-left px-4 py-2">Kurs</th>
              <th className="text-left px-4 py-2">Ta'lim shakli</th>
              <th className="text-left px-4 py-2">Guruh</th>
              <th className="px-4 py-2 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-2">{s.fullName}</td>
                <td className="px-4 py-2">{s.program}</td>
                <td className="px-4 py-2">{s.course}</td>
                <td className="px-4 py-2">{s.educationForm}</td>
                <td className="px-4 py-2">{s.group}</td>
                <td className="px-4 py-2 text-right">
                  <RoleGuard allow={['admin']}>
                    <Button variant="outline" className="mr-2" onClick={() => onEdit(s)}>Tahrirlash</Button>
                    <Button variant="outline" onClick={() => onDelete(s.id)}>O‘chirish</Button>
                  </RoleGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}


