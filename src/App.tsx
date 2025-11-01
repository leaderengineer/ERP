import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import { Dashboard, Teachers, Students, LibraryPage, Schedule, Programs, Attendance, Admin } from './pages'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/oqituvchilar" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
        <Route path="/talabalar" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/kutubxona" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="/jadval" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/yonalishlar" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
        <Route path="/davomat" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </MainLayout>
  )
}
