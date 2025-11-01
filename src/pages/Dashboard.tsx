import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { listTeachers } from '../services/teachers'
import { listStudents } from '../services/students'

const visits = [
  { name: 'Dush', value: 120 },
  { name: 'Sesh', value: 210 },
  { name: 'Chor', value: 160 },
  { name: 'Pay', value: 300 },
  { name: 'Jum', value: 250 },
]

const pieData = [
  { name: 'Yo‘nalish A', value: 400 },
  { name: 'Yo‘nalish B', value: 300 },
  { name: 'Yo‘nalish C', value: 300 },
]

const COLORS = ['#0ea5e9', '#22d3ee', '#60a5fa']

export default function Dashboard() {
  const teachers = listTeachers()
  const students = listStudents()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-card border border-border rounded p-4">
        <h2 className="text-white font-semibold mb-3">Haftalik tashriflar</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded p-4">
        <h2 className="text-white font-semibold mb-3">Statistika</h2>
        <div className="grid grid-cols-2 gap-3 text-gray-200 mb-3">
          <div className="bg-white/5 rounded p-3">
            <div className="text-xs text-gray-400">O‘qituvchilar</div>
            <div className="text-2xl font-semibold">{teachers.length}</div>
          </div>
          <div className="bg-white/5 rounded p-3">
            <div className="text-xs text-gray-400">Talabalar</div>
            <div className="text-2xl font-semibold">{students.length}</div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


