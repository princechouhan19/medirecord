import { useState, useEffect } from "react"
import api from "../../../services/api"
import "../styles/admin.scss"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get("/clinics").then(res => {
      const allUsers = []
      // We'll fetch users via a different approach
    })
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div><h1>Users</h1><p>All platform users</p></div>
      </div>
      <div className="card" style={{padding: "40px", textAlign: "center", color: "var(--text-muted)"}}>
        <p>User management — view and manage users across all clinics.</p>
        <p style={{fontSize: "13px", marginTop: "8px"}}>Navigate to individual clinics to manage their staff.</p>
      </div>
    </div>
  )
}
