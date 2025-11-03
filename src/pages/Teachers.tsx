import { useMemo, useState } from 'react'
import { Card, Button, Input } from '../components/ui'
import { listTeachers, createTeacher, updateTeacher, deleteTeacher, getTeacherPassword, SPECIALIZATION_OPTIONS, type Teacher } from '../services/teachers'
import { toCsv, downloadCsv } from '../utils/csv'
import RoleGuard from '../components/RoleGuard'

const DEGREE_OPTIONS = ['Katta o‘qituvchi', 'Yetakchi o‘qituvchi', 'Oliy o‘qituvchi']
const DEPARTMENT_OPTIONS = ['Aniq fanlar', 'Maxsus fanlar', 'Tikuvchilik', 'Avtomobil', 'Elektromontyor']
const FILTER_SELECT_CLASSNAME = 'w-full bg-[#19172a] text-white border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 hover:opacity-90 dark:bg-card/50 dark:text-gray-100 dark:border-border dark:focus:ring-primary dark:focus:border-primary'
const SELECT_CLASSNAME = 'w-full bg-[#19172a] text-white border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 hover:opacity-90 dark:bg-card/50 dark:text-gray-100 dark:border-border dark:focus:ring-primary dark:focus:border-primary'

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
        <Card className="text-gray-900 dark:text-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Ism</label>
              <Input value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Familiya</label>
              <Input value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Sharifi</label>
              <Input value={form.middleName || ''} onChange={e => setForm({ ...form, middleName: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">F.I.Sh</label>
              <Input value={computedFullName} disabled className="bg-gray-100 text-gray-600 cursor-not-allowed dark:bg-white/5 dark:text-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Username</label>
              <Input value={computedUsername} disabled className="bg-gray-100 text-gray-600 cursor-not-allowed dark:bg-white/5 dark:text-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Telefon</label>
              <Input
                value={form.phone || ''}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="99 123 45 67"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">Format: 99 123 45 67</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Kafedra</label>
              <select
                className={SELECT_CLASSNAME}
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Daraja</label>
              <select
                className={SELECT_CLASSNAME}
                value={form.degree}
                onChange={e => setForm({ ...form, degree: e.target.value })}
              >
                {DEGREE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-gray-300 mb-1.5">Mutaxasislik fani</label>
              <select
                className={SELECT_CLASSNAME}
                value={form.specialization || ''}
                onChange={e => {
                  const value = e.target.value
                  setForm({ 
                    ...form, 
                    specialization: value && SPECIALIZATION_OPTIONS.includes(value as any) 
                      ? (value as typeof SPECIALIZATION_OPTIONS[number]) 
                      : undefined 
                  })
                }}
              >
                <option value="">Fanini tanlang</option>
                {SPECIALIZATION_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-8 flex gap-2">
              <Button onClick={onSubmit} className="flex-1 sm:flex-none">{editingId ? 'Saqlash' : "Qo'shish"}</Button>
              {editingId && (
                <Button variant="outline" onClick={resetForm}>Bekor qilish</Button>
              )}
            </div>
          </div>
        </Card>
      </RoleGuard>

      <Card className="text-gray-900 dark:text-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Qidirish</label>
            <Input placeholder="Ism bo‘yicha..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Daraja</label>
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Kafedra</label>
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
        <div className="flex flex-col sm:flex-row justify-between gap-2 p-3">
          <label className="text-sm text-gray-300 flex items-center gap-2">
            <span>CSV import</span>
            <input type="file" accept=".csv" onChange={importCsv} className="hidden" id="t-import" />
            <Button asChild variant="outline"><label htmlFor="t-import" className="cursor-pointer">Yuklash</label></Button>
          </label>
          <Button variant="outline" onClick={exportCsv}>CSV eksport</Button>
        </div>
        
        {/* Desktop table view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 dark:from-white/5 dark:to-white/10 dark:text-gray-300 border-b-2 border-gray-300 dark:border-border">
              <tr>
                <th className="text-left px-4 py-3 font-bold">F.I.Sh</th>
                <th className="text-left px-4 py-3 font-bold">Username</th>
                <th className="text-left px-4 py-3 font-bold">Telefon</th>
                <th className="text-left px-4 py-3 font-bold">Kafedra</th>
                <th className="text-left px-4 py-3 font-bold">Daraja</th>
                <th className="text-left px-4 py-3 font-bold">Mutaxasislik</th>
                <th className="px-4 py-3 text-right font-bold">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-gray-200 dark:border-border hover:bg-blue-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <td className="px-4 py-2">{t.fullName}</td>
                  <td className="px-4 py-2">{t.username}</td>
                  <td className="px-4 py-2">{t.phone}</td>
                  <td className="px-4 py-2">{t.department}</td>
                  <td className="px-4 py-2">{t.degree}</td>
                  <td className="px-4 py-2">{t.specialization || '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <RoleGuard allow={['admin']}>
                      <div className="flex gap-2 justify-end flex-wrap">
                        <Button variant="outline" className="text-xs px-2 py-1" onClick={() => onEdit(t)}>Tahrirlash</Button>
                        <Button variant="outline" className="text-xs px-2 py-1" onClick={async () => { const pwd = getTeacherPassword(t.id); if (pwd) { try { await navigator.clipboard.writeText(pwd) } catch { }; alert(`Parol: ${pwd}`) } }}>Parol</Button>
                        <Button variant="outline" className="text-xs px-2 py-1" onClick={() => onDelete(t.id)}>O'chirish</Button>
                      </div>
                    </RoleGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet card view */}
        <div className="lg:hidden divide-y divide-gray-200 dark:divide-border">
          {filtered.map(t => (
            <div key={t.id} className="p-4 space-y-2">
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{t.fullName}</div>
                <div className="text-xs text-gray-700 dark:text-gray-400 mt-1 space-y-1">
                  <div>Username: {t.username}</div>
                  <div>Telefon: {t.phone || '—'}</div>
                  <div>Kafedra: {t.department || '—'}</div>
                  <div>Daraja: {t.degree || '—'}</div>
                  <div>Mutaxasislik: {t.specialization || '—'}</div>
                </div>
              </div>
              <RoleGuard allow={['admin']}>
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button variant="outline" className="text-xs flex-1 min-w-[100px]" onClick={() => onEdit(t)}>Tahrirlash</Button>
                  <Button variant="outline" className="text-xs flex-1 min-w-[100px]" onClick={async () => { const pwd = getTeacherPassword(t.id); if (pwd) { try { await navigator.clipboard.writeText(pwd) } catch { }; alert(`Parol: ${pwd}`) } }}>Parol</Button>
                  <Button variant="outline" className="text-xs flex-1 min-w-[100px]" onClick={() => onDelete(t.id)}>O'chirish</Button>
                </div>
              </RoleGuard>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}


