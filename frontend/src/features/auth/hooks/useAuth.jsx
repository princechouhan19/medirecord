import { createContext, useContext, useState, useEffect } from "react"
import api from "../../../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem("medi_token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      api.get("/auth/me")
        .then(res => setUser(res.data.user))
        .catch(() => { setToken(null); localStorage.removeItem("medi_token") })
        .finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem("medi_token", t)
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`
    setToken(t); setUser(u); return u
  }

  const logout = () => {
    localStorage.removeItem("medi_token")
    delete api.defaults.headers.common["Authorization"]
    setToken(null); setUser(null)
  }

  const role = user?.role
  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout, role,
      isSuperAdmin:   role === "superadmin",
      isClinicOwner:  role === "clinic_owner",
      isReceptionist: role === "receptionist",
      isLabHandler:   role === "lab_handler",
      isDoctor:       role === "doctor",
      clinicId: user?.clinic?._id || user?.clinic,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
