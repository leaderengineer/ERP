import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'admin' | 'teacher' | 'student' | 'guest'

interface AuthState {
  role: UserRole
  userName: string | null
}

const persisted = (() => {
  try { return JSON.parse(localStorage.getItem('auth') || 'null') as AuthState | null } catch { return null }
})()

const initialState: AuthState = persisted ?? {
  role: 'guest',
  userName: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ userName: string; role: UserRole }>) {
      state.userName = action.payload.userName
      state.role = action.payload.role
      localStorage.setItem('auth', JSON.stringify(state))
    },
    logout(state) {
      state.userName = null
      state.role = 'guest'
      localStorage.setItem('auth', JSON.stringify(state))
    },
    setRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload
      localStorage.setItem('auth', JSON.stringify(state))
    },
    setUserName(state, action: PayloadAction<string | null>) {
      state.userName = action.payload
      localStorage.setItem('auth', JSON.stringify(state))
    },
  },
})

export const { setRole, setUserName, login, logout } = authSlice.actions
export default authSlice.reducer


