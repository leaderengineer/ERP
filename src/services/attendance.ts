import { readFromStorage, writeToStorage } from './storage'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export type AttendanceRecord = {
  id: string
  date: string // YYYY-MM-DD
  studentId: string
  status: AttendanceStatus
}

const KEY = 'attendance-records'

export function listAttendance(date: string): AttendanceRecord[] {
  const all = readFromStorage<AttendanceRecord[]>(KEY, [])
  return all.filter(r => r.date === date)
}

export function setAttendance(date: string, studentId: string, status: AttendanceStatus) {
  const all = readFromStorage<AttendanceRecord[]>(KEY, [])
  const idx = all.findIndex(r => r.date === date && r.studentId === studentId)
  if (idx === -1) {
    all.push({ id: crypto.randomUUID(), date, studentId, status })
  } else {
    all[idx].status = status
  }
  writeToStorage(KEY, all)
}


