import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../services/api';
import './profile.scss';
import { Camera, Loader } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleTextChange = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setIsSaving(true);
    try {
      const { data } = await api.patch('/auth/profile', formData);
      setUser(data.user);
      setMsg('Profile updated successfully');
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMsg(''); setErr(''); setIsUploading(true);
    try {
      // 1. Upload to ImageKit via our backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', '/medirecord/avatars');
      
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { url, fileId } = uploadRes.data;

      // 2. Update user profile
      const { data } = await api.patch('/auth/profile', {
        profileImage: url,
        profileImageFileId: fileId
      });
      
      setUser(data.user);
      setMsg('Profile picture updated!');
    } catch (error) {
      setErr(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and avatar</p>
      </div>

      <div className="profile-content">
        <div className="card profile-card">
          {msg && <div className="alert alert--success">{msg}</div>}
          {err && <div className="alert alert--error">{err}</div>}
          
          <div className="avatar-section">
            <div className="avatar-wrapper">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <button 
                className="avatar-edit-btn" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader className="spin" size={16} /> : <Camera size={16} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                hidden 
              />
            </div>
            <div className="avatar-info">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className="badge badge--primary">{user?.role?.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>

          <form onSubmit={handleTextChange} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
