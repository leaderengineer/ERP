import React from 'react'
import RoleGuard from '../components/RoleGuard'
import { Card, Button, Input } from '../components/ui'
import {
  listLessons,
  addLesson,
  updateLesson,
  removeLesson,
  DAY_OPTIONS,
  PERIOD_OPTIONS,
  PERIOD_TIME_MAP,
  type Lesson,
  type Day,
  type Period,
} from '../services/schedule'
import { listTeachers } from '../services/teachers'

const SELECT_CLASSNAME = 'w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 text-sm'
const DAY_ORDER: Record<Day, number> = DAY_OPTIONS.reduce((acc, day, index) => {
  acc[day] = index
  return acc
}, {} as Record<Day, number>)

function sortLessons(entries: Lesson[]): Lesson[] {
  return [...entries].sort((a, b) => {
    const dayDiff = DAY_ORDER[a.day] - DAY_ORDER[b.day]
    if (dayDiff !== 0) return dayDiff
    return a.period - b.period
  })
}

type LessonPayload = Omit<Lesson, 'id'>

export default function Schedule() {
  const [lessons, setLessons] = React.useState<Lesson[]>(() => sortLessons(listLessons()))
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null)
  const teachers = React.useMemo(() => listTeachers(), [])

  const handleSaveLesson = React.useCallback((payload: LessonPayload) => {
    const saved = addLesson(payload)
    setLessons(prev => {
      const filtered = prev.filter(
        l => l.id !== saved.id && !(l.day === saved.day && l.period === saved.period),
      )
      return sortLessons([...filtered, saved])
    })
    return saved
  }, [])

  const handleUpdateLesson = React.useCallback((id: string, payload: Partial<LessonPayload>) => {
    const updated = updateLesson(id, payload)
    if (updated) {
      setLessons(prev => {
        const filtered = prev.filter(l => l.id !== id)
        return sortLessons([...filtered, updated])
      })
    }
    return updated
  }, [])

  const handleRemoveLesson = React.useCallback((id: string) => {
    removeLesson(id)
    setLessons(prev => prev.filter(l => l.id !== id))
    if (editingLessonId === id) {
      setEditingLessonId(null)
    }
  }, [editingLessonId])

  const handleEditLesson = React.useCallback((lesson: Lesson) => {
    setEditingLessonId(lesson.id)
  }, [])

  const orderedLessons = React.useMemo(() => sortLessons(lessons), [lessons])

  return (
    <div className="space-y-4">
      <Card className="text-gray-200">
        <h2 className="text-white font-semibold mb-3">Dars jadvallari</h2>
        <p className="mb-3">Jadvalni faqat admin tahrirlashi mumkin.</p>
        <RoleGuard allow={['admin']}>
          <AddLessonForm
            onSave={handleSaveLesson}
            onUpdate={handleUpdateLesson}
            lessons={orderedLessons}
            editingLessonId={editingLessonId}
            onCancelEdit={() => setEditingLessonId(null)}
          />
        </RoleGuard>
      </Card>

      <Card className="p-0 overflow-hidden">
        <WeeklyCalendar lessons={orderedLessons} />
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="text-left px-4 py-2">Kun</th>
              <th className="text-left px-4 py-2">Soat</th>
              <th className="text-left px-4 py-2">Vaqt</th>
              <th className="text-left px-4 py-2">Surat</th>
              <th className="text-left px-4 py-2">Surat o'qituvchisi</th>
              <th className="text-left px-4 py-2">Maxraj</th>
              <th className="text-left px-4 py-2">Maxraj o'qituvchisi</th>
              <th className="text-left px-4 py-2">Xona</th>
              <th className="px-4 py-2 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {orderedLessons.map(l => {
              const suratTeacher = l.suratTeacherId ? teachers.find(t => t.id === l.suratTeacherId) : null
              const maxrajTeacher = l.maxrajTeacherId ? teachers.find(t => t.id === l.maxrajTeacherId) : null
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-2">{l.day}</td>
                  <td className="px-4 py-2">{l.period}-soat</td>
                  <td className="px-4 py-2">{PERIOD_TIME_MAP[l.period]}</td>
                  <td className="px-4 py-2">{l.suratSubject}</td>
                  <td className="px-4 py-2">{suratTeacher?.fullName || '—'}</td>
                  <td className="px-4 py-2">{l.maxrajSubject || '—'}</td>
                  <td className="px-4 py-2">{maxrajTeacher?.fullName || '—'}</td>
                  <td className="px-4 py-2">{l.room || '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <RoleGuard allow={['admin']}>
                      <Button variant="outline" className="mr-2" onClick={() => handleEditLesson(l)}>Tahrirlash</Button>
                      <Button variant="outline" onClick={() => handleRemoveLesson(l.id)}>O'chirish</Button>
                    </RoleGuard>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

type FormState = {
  day: Day
  period: Period
  suratSubject: string
  maxrajSubject: string
  room: string
  hasAlternating: boolean
  suratTeacherId: string
  maxrajTeacherId: string
}

const INITIAL_FORM: FormState = {
  day: DAY_OPTIONS[0],
  period: PERIOD_OPTIONS[0],
  suratSubject: '',
  maxrajSubject: '',
  room: '',
  hasAlternating: false,
  suratTeacherId: '',
  maxrajTeacherId: '',
}

function AddLessonForm({
  onSave,
  onUpdate,
  lessons,
  editingLessonId,
  onCancelEdit,
}: {
  onSave: (payload: LessonPayload) => Lesson
  onUpdate: (id: string, payload: Partial<LessonPayload>) => Lesson | null
  lessons: Lesson[]
  editingLessonId: string | null
  onCancelEdit: () => void
}) {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const teachers = React.useMemo(() => listTeachers(), [])

  const editingLesson = React.useMemo(() =>
    editingLessonId ? lessons.find(l => l.id === editingLessonId) : null,
    [editingLessonId, lessons]
  )

  React.useEffect(() => {
    if (editingLesson) {
      setForm({
        day: editingLesson.day,
        period: editingLesson.period,
        suratSubject: editingLesson.suratSubject,
        maxrajSubject: editingLesson.maxrajSubject || '',
        room: editingLesson.room || '',
        hasAlternating: !!editingLesson.maxrajSubject,
        suratTeacherId: editingLesson.suratTeacherId || '',
        maxrajTeacherId: editingLesson.maxrajTeacherId || '',
      })
      setErrors({})
    } else {
      setForm(INITIAL_FORM)
      setErrors({})
    }
  }, [editingLesson])

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {}

    if (!form.suratSubject.trim()) {
      newErrors.suratSubject = 'Surat fani kiritilishi shart'
    }

    if (form.hasAlternating && !form.maxrajSubject.trim()) {
      newErrors.maxrajSubject = 'Maxraj fani kiritilishi shart'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function submit() {
    if (!validate()) {
      return
    }

    const surat = form.suratSubject.trim()
    const maxraj = form.hasAlternating ? form.maxrajSubject.trim() : ''

    const payload: LessonPayload = {
      day: form.day,
      period: form.period,
      suratSubject: surat,
      maxrajSubject: form.hasAlternating ? maxraj : undefined,
      room: form.room.trim() || undefined,
      suratTeacherId: form.suratTeacherId || undefined,
      maxrajTeacherId: form.hasAlternating && form.maxrajTeacherId ? form.maxrajTeacherId : undefined,
    }

    if (editingLessonId) {
      onUpdate(editingLessonId, payload)
      onCancelEdit()
    } else {
      onSave(payload)
      setForm(prev => ({
        ...INITIAL_FORM,
        day: prev.day,
        period: prev.period,
      }))
    }
    setErrors({})
  }

  function cancel() {
    onCancelEdit()
    setForm(INITIAL_FORM)
    setErrors({})
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Kun</label>
        <select
          className={SELECT_CLASSNAME}
          value={form.day}
          onChange={e => setForm(prev => ({ ...prev, day: e.target.value as Day }))}
        >
          {DAY_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Soat</label>
        <select
          className={SELECT_CLASSNAME}
          value={form.period}
          onChange={e => setForm(prev => ({ ...prev, period: Number(e.target.value) as Period }))}
        >
          {PERIOD_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}-soat ({PERIOD_TIME_MAP[option]})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Surat fani</label>
        <Input
          placeholder="Surat fanini kiriting"
          value={form.suratSubject}
          onChange={e => {
            setForm(prev => ({ ...prev, suratSubject: e.target.value }))
            if (errors.suratSubject) {
              setErrors(prev => ({ ...prev, suratSubject: undefined }))
            }
          }}
          className={errors.suratSubject ? 'border-red-500' : ''}
        />
        {errors.suratSubject && (
          <span className="text-xs text-red-400 mt-1 block">{errors.suratSubject}</span>
        )}
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Maxraj fani</label>
        <Input
          placeholder={form.hasAlternating ? 'Maxraj fanini kiriting' : "Kerak bo'lsa kiriting"}
          value={form.maxrajSubject}
          onChange={e => {
            setForm(prev => ({ ...prev, maxrajSubject: e.target.value }))
            if (errors.maxrajSubject) {
              setErrors(prev => ({ ...prev, maxrajSubject: undefined }))
            }
          }}
          disabled={!form.hasAlternating}
          className={`${!form.hasAlternating ? 'opacity-60 cursor-not-allowed' : ''} ${errors.maxrajSubject ? 'border-red-500' : ''}`}
        />
        {errors.maxrajSubject && (
          <span className="text-xs text-red-400 mt-1 block">{errors.maxrajSubject}</span>
        )}
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Surat o'qituvchisi</label>
        <select
          className={SELECT_CLASSNAME}
          value={form.suratTeacherId}
          onChange={e => setForm(prev => ({ ...prev, suratTeacherId: e.target.value }))}
        >
          <option value="">O'qituvchini tanlang</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}{teacher.specialization ? ` (${teacher.specialization})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Maxraj o'qituvchisi</label>
        <select
          className={`${SELECT_CLASSNAME} ${!form.hasAlternating ? 'opacity-60 cursor-not-allowed' : ''}`}
          value={form.maxrajTeacherId}
          onChange={e => setForm(prev => ({ ...prev, maxrajTeacherId: e.target.value }))}
          disabled={!form.hasAlternating}
        >
          <option value="">O'qituvchini tanlang</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}{teacher.specialization ? ` (${teacher.specialization})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Xona</label>
        <Input
          placeholder="Xona"
          value={form.room}
          onChange={e => setForm(prev => ({ ...prev, room: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={form.hasAlternating}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                hasAlternating: e.target.checked,
                maxrajSubject: e.target.checked ? prev.maxrajSubject : '',
                maxrajTeacherId: e.target.checked ? prev.maxrajTeacherId : '',
              }))
            }
          />
          Surat/Maxraj
        </label>
        <div className="flex gap-2">
          <Button onClick={submit}>{editingLessonId ? 'Saqlash' : "Qo'shish"}</Button>
          {editingLessonId && (
            <Button variant="outline" onClick={cancel}>Bekor qilish</Button>
          )}
        </div>
        {editingLessonId && (
          <span className="text-xs text-gray-400">Tahrirlash rejimi: {editingLesson?.suratSubject}</span>
        )}
      </div>
    </div>
  )
}

function WeeklyCalendar({ lessons }: { lessons: Lesson[] }) {
  const teachers = React.useMemo(() => listTeachers(), [])
  const grouped = React.useMemo(() => {
    const byDay: Record<Day, Lesson[]> = DAY_OPTIONS.reduce((acc, day) => {
      acc[day] = []
      return acc
    }, {} as Record<Day, Lesson[]>)
    for (const lesson of lessons) {
      if (!byDay[lesson.day]) {
        byDay[lesson.day] = []
      }
      byDay[lesson.day].push(lesson)
    }
    for (const day of DAY_OPTIONS) {
      byDay[day] = sortLessons(byDay[day])
    }
    return byDay
  }, [lessons])

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        {DAY_OPTIONS.map(day => {
          const dayLessons = grouped[day] ?? []
          return (
            <div key={day} className="border border-border rounded">
              <div className="px-3 py-2 bg-white/5 text-gray-300 font-medium">{day}</div>
              <div className="p-3 space-y-2">
                {dayLessons.length === 0 && <div className="text-gray-500 text-sm">Bo‘sh</div>}
                {dayLessons.map(lesson => {
                  const suratTeacher = lesson.suratTeacherId ? teachers.find(t => t.id === lesson.suratTeacherId) : null
                  const maxrajTeacher = lesson.maxrajTeacherId ? teachers.find(t => t.id === lesson.maxrajTeacherId) : null
                  return (
                    <div
                      key={lesson.id}
                      className="bg-primary/10 border border-primary/30 rounded px-2 py-2 text-sm text-gray-100"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{lesson.period}-soat</span>
                        <span>{PERIOD_TIME_MAP[lesson.period]}</span>
                      </div>
                      <div className="mt-1">
                        <div className="font-semibold text-gray-100">Surat: {lesson.suratSubject}</div>
                        {suratTeacher && (
                          <div className="text-xs text-gray-400 mt-1">O'qituvchi: {suratTeacher.fullName}</div>
                        )}
                        {lesson.maxrajSubject && (
                          <div className="text-xs text-primary-200 mt-1">Maxraj: {lesson.maxrajSubject}</div>
                        )}
                        {maxrajTeacher && (
                          <div className="text-xs text-gray-400 mt-1">O'qituvchi: {maxrajTeacher.fullName}</div>
                        )}
                      </div>
                      {lesson.room && (
                        <div className="text-xs text-gray-300 mt-1">Xona: {lesson.room}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


