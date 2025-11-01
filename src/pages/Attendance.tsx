import { useMemo, useState } from 'react'
import { Card, Button, Input } from '../components/ui'
import { listStudents, GROUPS_BY_COURSE, COURSE_OPTIONS, FIRST_COURSE_GROUPS, SECOND_COURSE_GROUPS, type Course } from '../services/students'
import { listAttendance, setAttendance, type AttendanceStatus } from '../services/attendance'
import RoleGuard from '../components/RoleGuard'
import { toCsv, downloadCsv } from '../utils/csv'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

const SELECT_CLASSNAME = 'w-full bg-transparent text-gray-200 border border-border rounded px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/40'

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ]
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function getStatusColor(status: AttendanceStatus | undefined): string {
  switch (status) {
    case 'present':
      return 'bg-green-500/20 border-green-500/50 text-green-300'
    case 'absent':
      return 'bg-red-500/20 border-red-500/50 text-red-300'
    case 'late':
      return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
    default:
      return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
  }
}

function getStatusLabel(status: AttendanceStatus | undefined): string {
  switch (status) {
    case 'present':
      return 'Keldi'
    case 'absent':
      return 'Kelmedi'
    case 'late':
      return 'Kechikdi'
    default:
      return 'Belgilanmagan'
  }
}

export default function Attendance() {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<Course | ''>('')
  const [date, setDate] = useState(todayStr())
  const [recordsVersion, setRecordsVersion] = useState(0)

  const allStudents = useMemo(() => listStudents(), [])
  const records = useMemo(() => listAttendance(date), [date, recordsVersion])

  const availableGroups = useMemo(() => {
    if (!selectedCourse) return []
    return GROUPS_BY_COURSE[selectedCourse as Course] || []
  }, [selectedCourse])

  const filteredStudents = useMemo(() => {
    if (!selectedGroup) return []
    return allStudents.filter(s => s.group === selectedGroup)
  }, [allStudents, selectedGroup])

  function statusOf(studentId: string): AttendanceStatus | undefined {
    return records.find(r => r.studentId === studentId)?.status
  }

  function mark(studentId: string, status: AttendanceStatus) {
    setAttendance(date, studentId, status)
    setRecordsVersion(v => v + 1)
  }

  function exportCsv() {
    if (!selectedGroup) return
    const header = ['T/r', 'F.I.Sh', 'Guruh', 'Holat']
    const rows = filteredStudents.map((s, idx) => {
      const status = statusOf(s.id)
      return [String(idx + 1), s.fullName, selectedGroup, getStatusLabel(status)]
    })
    const csv = toCsv([header, ...rows])
    downloadCsv(`davomat-${selectedGroup}-${date}.csv`, csv)
  }

  const presentCount = useMemo(() => {
    return filteredStudents.filter(s => statusOf(s.id) === 'present').length
  }, [filteredStudents, records])

  const absentCount = useMemo(() => {
    return filteredStudents.filter(s => statusOf(s.id) === 'absent').length
  }, [filteredStudents, records])

  const lateCount = useMemo(() => {
    return filteredStudents.filter(s => statusOf(s.id) === 'late').length
  }, [filteredStudents, records])

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedGroup) return false
    return filteredStudents.some(s => {
      const currentStatus = statusOf(s.id)
      return currentStatus !== undefined
    })
  }, [filteredStudents, records, selectedGroup])

  function handleSave() {
    // Ma'lumotlar avtomatik saqlanadi, lekin xabarni ko'rsatamiz
    alert('Davomat muvaffaqiyatli saqlandi!')
  }

  // 1-kurs guruhlari uchun statistikani hisoblash
  const firstCourseStats = useMemo(() => {
    return FIRST_COURSE_GROUPS.map(group => {
      const groupStudents = allStudents.filter(s => s.group === group)
      const present = groupStudents.filter(s => {
        const record = records.find(r => r.studentId === s.id)
        return record?.status === 'present'
      }).length
      const absent = groupStudents.filter(s => {
        const record = records.find(r => r.studentId === s.id)
        return record?.status === 'absent'
      }).length
      const late = groupStudents.filter(s => {
        const record = records.find(r => r.studentId === s.id)
        return record?.status === 'late'
      }).length
      const total = groupStudents.length
      const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0
      
      return {
        group,
        present,
        absent,
        late,
        total,
        attendanceRate: Math.round(attendanceRate),
      }
    })
  }, [allStudents, records])

  // 2-kurs guruhlari uchun statistikani hisoblash
  const secondCourseStats = useMemo(() => {
    return SECOND_COURSE_GROUPS.map(group => {
      const groupStudents = allStudents.filter(s => s.group === group)
      const present = groupStudents.filter(s => {
        const record = records.find(r => r.studentId === s.id)
        return record?.status === 'present'
      }).length
      const absent = groupStudents.filter(s => {
        const record = records.find(r => r.studentId === s.id)
        return record?.status === 'absent'
      }).length
      const late = groupStudents.filter(s => {
        const record = records.find(r => r.studentId === s.id)
        return record?.status === 'late'
      }).length
      const total = groupStudents.length
      const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0
      
      return {
        group,
        present,
        absent,
        late,
        total,
        attendanceRate: Math.round(attendanceRate),
      }
    })
  }, [allStudents, records])

  const chartColors = {
    present: '#10b981',
    absent: '#ef4444',
    late: '#eab308',
  }

  return (
    <div className="space-y-4">
      <Card className="text-gray-200">
        <h2 className="text-white font-semibold text-lg mb-4">Davomat jurnali</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Kurs</label>
            <select
              className={SELECT_CLASSNAME}
              value={selectedCourse}
              onChange={e => {
                const course = e.target.value as Course | ''
                setSelectedCourse(course)
                setSelectedGroup('')
              }}
            >
              <option value="">Kursni tanlang</option>
              {COURSE_OPTIONS.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Guruh</label>
            <select
              className={SELECT_CLASSNAME}
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">Guruhni tanlang</option>
              {availableGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sana</label>
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={exportCsv}
              disabled={!selectedGroup}
              className="w-full"
            >
              CSV eksport
            </Button>
          </div>
        </div>
        
        {selectedGroup && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-sm text-gray-400 mb-2">
              <span className="font-medium text-white">{formatDate(date)}</span>
              <span className="ml-2">•</span>
              <span className="ml-2">Guruh: <span className="text-white font-medium">{selectedGroup}</span></span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Keldi</div>
                <div className="text-2xl font-bold text-green-400">{presentCount}</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Kelmedi</div>
                <div className="text-2xl font-bold text-red-400">{absentCount}</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Kechikdi</div>
                <div className="text-2xl font-bold text-yellow-400">{lateCount}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {selectedGroup && filteredStudents.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-border">
            <h3 className="text-white font-semibold">O'quvchilar ro'yxati ({filteredStudents.length} ta)</h3>
          </div>
          <div className="divide-y divide-border">
            {filteredStudents.map((student, idx) => {
              const status = statusOf(student.id)
              return (
                <div 
                  key={student.id} 
                  className={`p-4 hover:bg-white/5 transition-colors border-l-4 ${getStatusColor(status).split(' ')[1]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">{student.fullName}</div>
                        {student.program && (
                          <div className="text-xs text-gray-400 mt-0.5">{student.program}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded text-sm font-medium border ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                      </div>
                      
                      <RoleGuard allow={['admin', 'teacher']}>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => mark(student.id, 'present')}
                            className={`text-xs px-3 py-1.5 ${
                              status === 'present' 
                                ? 'bg-green-500/20 border-green-500 text-green-300' 
                                : 'hover:bg-green-500/10 hover:border-green-500/50'
                            }`}
                          >
                            Keldi
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => mark(student.id, 'absent')}
                            className={`text-xs px-3 py-1.5 ${
                              status === 'absent' 
                                ? 'bg-red-500/20 border-red-500 text-red-300' 
                                : 'hover:bg-red-500/10 hover:border-red-500/50'
                            }`}
                          >
                            Kelmedi
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => mark(student.id, 'late')}
                            className={`text-xs px-3 py-1.5 ${
                              status === 'late' 
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' 
                                : 'hover:bg-yellow-500/10 hover:border-yellow-500/50'
                            }`}
                          >
                            Kechikdi
                          </Button>
                        </div>
                      </RoleGuard>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {hasUnsavedChanges && (
            <div className="p-4 bg-white/5 border-t border-border">
              <RoleGuard allow={['admin', 'teacher']}>
                <Button onClick={handleSave} className="w-full">
                  Davomatni saqlash
                </Button>
              </RoleGuard>
            </div>
          )}
        </Card>
      ) : selectedGroup && filteredStudents.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400">
            <div className="text-lg mb-2">Guruhda o'quvchilar topilmadi</div>
            <div className="text-sm">Bu guruh uchun o'quvchi ro'yxati bo'sh</div>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <div className="text-gray-400">
            <div className="text-lg mb-2">Guruhni tanlang</div>
            <div className="text-sm">Davomat olish uchun avval kurs va guruhni tanlang</div>
          </div>
        </Card>
      )}

      {/* Diagrammalar bo'limi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1-kurs guruhlari diagrammasi */}
        <Card className="text-gray-200">
          <h3 className="text-white font-semibold text-lg mb-4">1-kurs guruhlari davomat statistikasi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={firstCourseStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="group" 
                  stroke="#94a3b8" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={11}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#94a3b8' }}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      present: 'Keldi',
                      absent: 'Kelmedi',
                      late: 'Kechikdi'
                    }
                    return labels[value] || value
                  }}
                />
                <Bar dataKey="present" fill={chartColors.present} name="present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill={chartColors.absent} name="absent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill={chartColors.late} name="late" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Sana: {formatDate(date)}
          </div>
        </Card>

        {/* 2-kurs guruhlari diagrammasi */}
        <Card className="text-gray-200">
          <h3 className="text-white font-semibold text-lg mb-4">2-kurs guruhlari davomat statistikasi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={secondCourseStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="group" 
                  stroke="#94a3b8" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={11}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#94a3b8' }}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      present: 'Keldi',
                      absent: 'Kelmedi',
                      late: 'Kechikdi'
                    }
                    return labels[value] || value
                  }}
                />
                <Bar dataKey="present" fill={chartColors.present} name="present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill={chartColors.absent} name="absent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill={chartColors.late} name="late" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Sana: {formatDate(date)}
          </div>
        </Card>
      </div>
    </div>
  )
}
