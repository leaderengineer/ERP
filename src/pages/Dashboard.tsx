import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { listTeachers } from '../services/teachers'
import { listStudents } from '../services/students'
import { Card } from '../components/ui'

const visits = [
  { name: 'Dush', value: 120 },
  { name: 'Sesh', value: 210 },
  { name: 'Chor', value: 160 },
  { name: 'Pay', value: 300 },
  { name: 'Jum', value: 250 },
]

const pieData = [
  { name: "Yo'nalish A", value: 400 },
  { name: "Yo'nalish B", value: 300 },
  { name: "Yo'nalish C", value: 300 },
]

const COLORS_LIGHT = ['#2563eb', '#3b82f6', '#60a5fa']
const COLORS_DARK = ['#0ea5e9', '#22d3ee', '#60a5fa']

function getTooltipStyle() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return {
    background: isDark ? '#0f172a' : '#ffffff',
    border: isDark ? '1px solid #1e293b' : '2px solid #d1d5db',
    borderRadius: '8px',
    color: isDark ? '#ffffff' : '#111827',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }
}

function getGridColor() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return isDark ? '#1e293b' : '#e5e7eb'
}

function getAxisColor() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return isDark ? '#94a3b8' : '#6b7280'
}

function getLineColor() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return isDark ? '#0ea5e9' : '#2563eb'
}

function getColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return isDark ? COLORS_DARK : COLORS_LIGHT
}

export default function Dashboard() {
  const teachers = listTeachers()
  const students = listStudents()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h2 className="text-gray-900 dark:text-white font-bold text-base md:text-lg mb-3">Haftalik tashriflar</h2>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visits}>
              <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} />
              <XAxis dataKey="name" stroke={getAxisColor()} fontWeight={600} />
              <YAxis stroke={getAxisColor()} fontWeight={600} />
              <Tooltip contentStyle={getTooltipStyle()} />
              <Line type="monotone" dataKey="value" stroke={getLineColor()} strokeWidth={3} dot={{ fill: getLineColor(), r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="text-gray-900 dark:text-white font-bold text-base md:text-lg mb-3">Statistika</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-blue-50 dark:bg-white/5 rounded-lg p-3 border-2 border-blue-100 dark:border-white/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">O'qituvchilar</div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-primary">{teachers.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-white/5 rounded-lg p-3 border-2 border-green-100 dark:border-white/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">Talabalar</div>
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{students.length}</div>
          </div>
        </div>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={getColors()[index % getColors().length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={getTooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}


