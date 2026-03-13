import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import api from "../../../services/api";
import { Camera, Loader, Edit2, X } from "lucide-react";
import "../styles/clinic.scss";

export default function ClinicSettingsPage() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [clinicForm, setClinicForm] = useState({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);

  useEffect(() => {
    api.get("/clinics/my/clinic").then((res) => setClinic(res.data.clinic));
  }, []);

  useEffect(() => {
    if (clinic) {
      setClinicForm({
        name: clinic.name || "",
        city: clinic.city || "",
        licenseNumber: clinic.licenseNumber || "",
        specialization: clinic.specialization || ""
      });
    }
  }, [clinic]);

  const handleUpdateClinic = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.patch('/clinics/my/clinic', clinicForm);
      setClinic(data.clinic);
      setIsEditingClinic(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update clinic');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '/medirecord/logos');
      
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { url, fileId } = uploadRes.data;

      const { data } = await api.patch('/clinics/my/clinic', {
        logo: url,
        logoFileId: fileId
      });
      
      setClinic(data.clinic);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassErr("");
    if (passForm.newPassword !== passForm.confirm)
      return setPassErr("Passwords do not match");
    try {
      await api.patch("/auth/change-password", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassMsg("Password updated successfully");
      setPassForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPassErr(err.response?.data?.error || "Failed");
    }
  };

  return (
    <div className="clinic-page">
      <div className="clinic-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your clinic account settings</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card settings-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="settings-card__title" style={{ marginBottom: 0 }}>Clinic Profile</h3>
            {!isEditingClinic ? (
              <button className="btn btn--outline" onClick={() => setIsEditingClinic(true)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Edit2 size={14} style={{ marginRight: '6px' }} /> Edit
              </button>
            ) : (
              <button className="btn btn--danger" onClick={() => { setIsEditingClinic(false); setClinicForm({ name: clinic.name, city: clinic.city, licenseNumber: clinic.licenseNumber, specialization: clinic.specialization }) }} style={{ padding: '6px 12px', fontSize: '12px' }}>
                <X size={14} style={{ marginRight: '6px' }} /> Cancel
              </button>
            )}
          </div>
          
          {clinic && (
            <div className="clinic-profile-section" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)' }}>
                  {clinic.logo ? (
                    <img src={clinic.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                  ) : (
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{clinic.name?.[0]?.toUpperCase()}</span>
                  )}
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    {isUploadingLogo ? <Loader className="spin" size={14} /> : <Camera size={14} />}
                  </button>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" hidden />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{clinic.name}</h4>
                  <span className={`badge badge--${clinic.isActive ? "success" : "danger"}`}>
                    {clinic.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>

              {!isEditingClinic ? (
                <div className="settings-info">
                  <div className="settings-row">
                    <label>Clinic Name</label>
                    <span>{clinic.name}</span>
                  </div>
                  <div className="settings-row">
                    <label>License Number</label>
                    <span>{clinic.licenseNumber || "—"}</span>
                  </div>
                  <div className="settings-row">
                    <label>Specialization</label>
                    <span>{clinic.specialization || "—"}</span>
                  </div>
                  <div className="settings-row">
                    <label>Plan</label>
                    <span className={`badge badge--${clinic.plan === "enterprise" ? "warning" : "primary"}`}>
                      {clinic.plan?.toUpperCase()}
                    </span>
                  </div>
                  <div className="settings-row">
                    <label>City</label>
                    <span>{clinic.city || "—"}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateClinic} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Clinic Name</label>
                    <input type="text" value={clinicForm.name} onChange={e => setClinicForm({...clinicForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>License Number</label>
                    <input type="text" value={clinicForm.licenseNumber} onChange={e => setClinicForm({...clinicForm, licenseNumber: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input type="text" value={clinicForm.specialization} onChange={e => setClinicForm({...clinicForm, specialization: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={clinicForm.city} onChange={e => setClinicForm({...clinicForm, city: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>Save Clinic Updates</button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="card settings-card">
          <h3 className="settings-card__title">My Account</h3>
          <div className="settings-info">
            <div className="settings-row">
              <label>Name</label>
              <span>{user?.name}</span>
            </div>
            <div className="settings-row">
              <label>Email</label>
              <span>{user?.email}</span>
            </div>
            <div className="settings-row">
              <label>Role</label>
              <span className="badge badge--primary">Clinic Owner</span>
            </div>
            <div className="settings-row">
              <label>Last Login</label>
              <span>
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString("en-IN")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="card settings-card">
          <h3 className="settings-card__title">Change Password</h3>
          {passMsg && <div className="alert alert--success">{passMsg}</div>}
          {passErr && <div className="alert alert--error">{passErr}</div>}
          <form
            onSubmit={handleChangePassword}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passForm.currentPassword}
                onChange={(e) =>
                  setPassForm({ ...passForm, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passForm.newPassword}
                onChange={(e) =>
                  setPassForm({ ...passForm, newPassword: e.target.value })
                }
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passForm.confirm}
                onChange={(e) =>
                  setPassForm({ ...passForm, confirm: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              style={{ alignSelf: "flex-start" }}
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
