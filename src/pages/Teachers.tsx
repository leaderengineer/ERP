import { useMemo, useState } from 'react'
import { Card, Button, Input } from '../components/ui'
import { listTeachers, createTeacher, updateTeacher, deleteTeacher, getTeacherPassword, SPECIALIZATION_OPTIONS, type Teacher } from '../services/teachers'
import { toCsv, downloadCsv } from '../utils/csv'
import RoleGuard from '../components/RoleGuard'

const DEGREE_OPTIONS = ['Katta o‘qituvchi', 'Yetakchi o‘qituvchi', 'Oliy o‘qituvchi']
const DEPARTMENT_OPTIONS = ['Aniq fanlar', 'Maxsus fanlar', 'Tikuvchilik', 'Avtomobil', 'Elektromontyor']
const FILTER_SELECT_CLASSNAME = 'w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 text-sm'

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => listTeachers())
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ degree: '', department: '' })
  const [form, setForm] = useState<Partial<Teacher>>({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    department: DEPARTMENT_OPTIONS[0],
    degree: DEGREE_OPTIONS[0],
    specialization: undefined,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const computedFullName = useMemo(() => {
    const parts = [form.firstName, form.lastName, form.middleName].filter(Boolean)
    return parts.join(' ') || ''
  }, [form.firstName, form.lastName, form.middleName])

  const computedUsername = useMemo(() => {
    if (!form.firstName || !form.lastName) return ''
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
    const first = normalize(form.firstName)
    const last = normalize(form.lastName)
    const middle = form.middleName ? normalize(form.middleName) : ''

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

    let candidate = base
    let counter = 1
    const existing = editingId ? teachers.filter(t => t.id !== editingId) : teachers

    while (existing.some(t => t.username.toLowerCase() === candidate.toLowerCase())) {
      const suffix = counter.toString()
      const trimmed = base.slice(0, Math.max(1, maxLen - suffix.length))
      candidate = `${trimmed}${suffix}`.slice(0, maxLen)
      counter++
    }

    return candidate
  }, [form.firstName, form.lastName, form.middleName, editingId, teachers])

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase()
    return teachers.filter(t => {
      const matchesQuery = (t.fullName || '').toLowerCase().includes(q)
      if (!matchesQuery) return false
      if (filters.degree && t.degree !== filters.degree) return false
      if (filters.department && t.department !== filters.department) return false
      return true
    })
  }, [teachers, query, filters.degree, filters.department])

  function resetForm() {
    setForm({
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      department: DEPARTMENT_OPTIONS[0],
      degree: DEGREE_OPTIONS[0],
      specialization: undefined,
    })
    setEditingId(null)
  }

  async function onSubmit() {
    if (!form.firstName?.trim() || !form.lastName?.trim()) return

    if (editingId) {
      const updated = updateTeacher(editingId, {
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName,
        phone: form.phone,
        department: form.department,
        degree: form.degree,
        specialization: form.specialization,
      })
      if (updated) setTeachers(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    } else {
      const created = createTeacher({
        firstName: form.firstName!,
        lastName: form.lastName!,
        middleName: form.middleName,
        phone: form.phone,
        department: form.department,
        degree: form.degree,
        specialization: form.specialization,
      })
      setTeachers(prev => [created, ...prev])
      const pwd = created.password
      try {
        await navigator.clipboard.writeText(pwd)
      } catch {}
      alert(`Yangi o'qituvchi yaratildi. Parol: ${pwd}\n(Chekiladi: clipboardga nusxa olindi)`)    
    }
    resetForm()
  }

  function onEdit(t: Teacher) {
    setEditingId(t.id)
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      middleName: t.middleName,
      phone: t.phone,
      department: t.department,
      degree: t.degree,
      specialization: t.specialization,
    })
  }

  function onDelete(id: string) {
    deleteTeacher(id)
    setTeachers(prev => prev.filter(t => t.id !== id))
  }

  function exportCsv() {
    const header = ['Ism', 'Familiya', 'Sharifi', 'F.I.Sh', 'Username', 'Telefon', 'Kafedra', 'Daraja', 'Mutaxasislik']
    const rows = teachers.map(t => [
      t.firstName || '',
      t.lastName || '',
      t.middleName || '',
      t.fullName,
      t.username || '',
      t.phone || '',
      t.department || '',
      t.degree || '',
      t.specialization || '',
    ])
    downloadCsv('oqituvchilar.csv', toCsv([header, ...rows]))
  }

  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = text.split(/\r?\n/).map(r => r.split(','))
    const [header, ...data] = rows
    const fnIdx = header.findIndex(h => /ism|first/i.test(h))
    const lnIdx = header.findIndex(h => /fam|last/i.test(h))
    const mnIdx = header.findIndex(h => /sharif|middle/i.test(h))
    const fullIdx = header.findIndex(h => /f\.i\.sh|fio|full/i.test(h))
    const phoneIdx = header.findIndex(h => /tel|phone/i.test(h))
    const deptIdx = header.findIndex(h => /kaf|dept|yo/i.test(h))
    const degreeIdx = header.findIndex(h => /daraja|degree/i.test(h))
    const specIdx = header.findIndex(h => /mutaxasislik|specialization|fan/i.test(h))
    const created: Teacher[] = []
    for (const r of data) {
      const firstName = fnIdx >= 0 ? r[fnIdx] : ''
      const lastName = lnIdx >= 0 ? r[lnIdx] : ''
      const middleName = mnIdx >= 0 ? r[mnIdx] : ''
      const fullName = fullIdx >= 0 && r[fullIdx] ? r[fullIdx] : `${firstName} ${lastName}${middleName ? ' ' + middleName : ''}`.trim()
      if (!fullName) continue
      const specValue = specIdx >= 0 ? r[specIdx]?.trim() : undefined
      const specialization = specValue && SPECIALIZATION_OPTIONS.includes(specValue as any) ? specValue : undefined
      const c = createTeacher({
        firstName,
        lastName,
        middleName,
        phone: phoneIdx >= 0 ? r[phoneIdx] : '',
        department: deptIdx >= 0 ? r[deptIdx] : '',
        degree: degreeIdx >= 0 ? r[degreeIdx] : '',
        specialization: specialization as any,
      })
      created.push(c)
    }
    setTeachers(prev => [...created, ...prev])
    e.currentTarget.value = ''
  }

  return (
    <div className="space-y-4">
      <RoleGuard allow={['admin']}>
        <Card className="text-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ism</label>
              <Input value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Familiya</label>
              <Input value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sharifi</label>
              <Input value={form.middleName || ''} onChange={e => setForm({ ...form, middleName: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">F.I.Sh</label>
              <Input value={computedFullName} disabled className="bg-white/5 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Username</label>
              <Input value={computedUsername} disabled className="bg-white/5 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Telefon</label>
              <Input
                value={form.phone || ''}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="99 123 45 67"
              />
              <span className="text-xs text-gray-500">Format: 99 123 45 67</span>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kafedra</label>
              <select
                className="w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 text-sm"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Daraja</label>
              <select
                className="w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 text-sm"
                value={form.degree}
                onChange={e => setForm({ ...form, degree: e.target.value })}
              >
                {DEGREE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mutaxasislik fani</label>
              <select
                className="w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 text-sm"
                value={form.specialization || ''}
                onChange={e => setForm({ ...form, specialization: e.target.value || undefined })}
              >
                <option value="">Fanini tanlang</option>
                {SPECIALIZATION_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-8">
              <Button onClick={onSubmit}>{editingId ? 'Saqlash' : 'Qo‘shish'}</Button>
              {editingId && (
                <Button variant="outline" className="ml-2" onClick={resetForm}>Bekor qilish</Button>
              )}
            </div>
          </div>
        </Card>
      </RoleGuard>

      <Card className="text-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Qidirish</label>
            <Input placeholder="Ism bo‘yicha..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Daraja</label>
            <select
              className={FILTER_SELECT_CLASSNAME}
              value={filters.degree}
              onChange={e => setFilters(prev => ({ ...prev, degree: e.target.value }))}
            >
              <option value="">Barchasi</option>
              {DEGREE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Kafedra</label>
            <select
              className={FILTER_SELECT_CLASSNAME}
              value={filters.department}
              onChange={e => setFilters(prev => ({ ...prev, department: e.target.value }))}
            >
              <option value="">Barchasi</option>
              {DEPARTMENT_OPTIONS.map(option => (
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
            <input type="file" accept=".csv" onChange={importCsv} className="hidden" id="t-import" />
            <Button asChild variant="outline"><label htmlFor="t-import">Yuklash</label></Button>
          </label>
          <Button variant="outline" onClick={exportCsv}>CSV eksport</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="text-left px-4 py-2">F.I.Sh</th>
              <th className="text-left px-4 py-2">Username</th>
              <th className="text-left px-4 py-2">Telefon</th>
              <th className="text-left px-4 py-2">Kafedra</th>
              <th className="text-left px-4 py-2">Daraja</th>
              <th className="text-left px-4 py-2">Mutaxasislik</th>
              <th className="px-4 py-2 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {filtered.map(t => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-2">{t.fullName}</td>
                <td className="px-4 py-2">{t.username}</td>
                <td className="px-4 py-2">{t.phone}</td>
                <td className="px-4 py-2">{t.department}</td>
                <td className="px-4 py-2">{t.degree}</td>
                <td className="px-4 py-2">{t.specialization || '—'}</td>
                <td className="px-4 py-2 text-right">
                  <RoleGuard allow={['admin']}>
                    <Button variant="outline" className="mr-2" onClick={() => onEdit(t)}>Tahrirlash</Button>
                    <Button variant="outline" className="mr-2" onClick={async () => { const pwd = getTeacherPassword(t.id); if (pwd) { try { await navigator.clipboard.writeText(pwd) } catch { }; alert(`Parol: ${pwd}`) } }}>Parol</Button>
                    <Button variant="outline" onClick={() => onDelete(t.id)}>O‘chirish</Button>
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


