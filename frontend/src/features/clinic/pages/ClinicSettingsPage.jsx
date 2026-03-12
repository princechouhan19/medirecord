import { useState, useEffect } from "react"
import { useAuth } from "../../auth/hooks/useAuth"
import api from "../../../services/api"
import "../styles/clinic.scss"

export default function ClinicSettingsPage() {
  const { user } = useAuth()
  const [clinic, setClinic] = useState(null)
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirm: "" })
  const [passMsg, setPassMsg] = useState("")
  const [passErr, setPassErr] = useState("")

  useEffect(() => {
    api.get("/clinics/my/clinic").then(res => setClinic(res.data.clinic))
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassMsg(""); setPassErr("")
    if (passForm.newPassword !== passForm.confirm) return setPassErr("Passwords do not match")
    try {
      await api.patch("/auth/change-password", { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPassMsg("Password updated successfully")
      setPassForm({ currentPassword: "", newPassword: "", confirm: "" })
    } catch (err) { setPassErr(err.response?.data?.error || "Failed") }
  }

  return (
    <div className="clinic-page">
      <div className="clinic-header">
        <div><h1>Settings</h1><p>Manage your clinic account settings</p></div>
      </div>

      <div className="settings-grid">
        <div className="card settings-card">
          <h3 className="settings-card__title">Clinic Information</h3>
          {clinic && (
            <div className="settings-info">
              <div className="settings-row"><label>Clinic Name</label><span>{clinic.name}</span></div>
              <div className="settings-row"><label>License Number</label><span>{clinic.licenseNumber || "—"}</span></div>
              <div className="settings-row"><label>Specialization</label><span>{clinic.specialization || "—"}</span></div>
              <div className="settings-row"><label>Plan</label><span className={`badge badge--${clinic.plan === "enterprise" ? "warning" : "primary"}`}>{clinic.plan?.toUpperCase()}</span></div>
              <div className="settings-row"><label>City</label><span>{clinic.city || "—"}</span></div>
              <div className="settings-row"><label>Status</label><span className={`badge badge--${clinic.isActive ? "success" : "danger"}`}>{clinic.isActive ? "Active" : "Suspended"}</span></div>
            </div>
          )}
        </div>

        <div className="card settings-card">
          <h3 className="settings-card__title">My Account</h3>
          <div className="settings-info">
            <div className="settings-row"><label>Name</label><span>{user?.name}</span></div>
            <div className="settings-row"><label>Email</label><span>{user?.email}</span></div>
            <div className="settings-row"><label>Role</label><span className="badge badge--primary">Clinic Owner</span></div>
            <div className="settings-row"><label>Last Login</label><span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "—"}</span></div>
          </div>
        </div>

        <div className="card settings-card">
          <h3 className="settings-card__title">Change Password</h3>
          {passMsg && <div className="alert alert--success">{passMsg}</div>}
          {passErr && <div className="alert alert--error">{passErr}</div>}
          <form onSubmit={handleChangePassword} style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            <div className="form-group"><label>Current Password</label><input type="password" value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} required /></div>
            <div className="form-group"><label>New Password</label><input type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} required minLength={6} /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} required /></div>
            <button type="submit" className="btn btn--primary" style={{alignSelf: "flex-start"}}>Update Password</button>
          </form>
        </div>
      </div>
    </div>
  )
}
