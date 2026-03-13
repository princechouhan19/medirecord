import React from 'react';
import { X, Calendar, User, Phone, Mail, Award, Clock } from 'lucide-react';

export default function ClinicDetailsModal({ clinic, onClose }) {
  if (!clinic) return null;

  const subscription = clinic.subscription || { plan: 'free', endDate: null };
  const isExpired = subscription.endDate ? new Date() > new Date(subscription.endDate) : false;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRemainingDays = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getRemainingDays(subscription.endDate);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide" style={{ borderRadius: '12px' }}>
        <div className="modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="clinic-cell__avatar" style={{ width: '40px', height: '40px', fontSize: '18px' }}>
              {clinic.name[0]}
            </div>
            <div>
              <h2>{clinic.name}</h2>
              <span className={`badge badge--${clinic.isActive ? 'success' : 'danger'}`}>
                {clinic.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__scroll-content">
          <div className="clinic-details-container">
            {/* Left Column: Subscription info */}
            <div>
              <div className="modal__section-title">Subscription Status</div>
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} color="var(--primary)" />
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>
                      {subscription.plan.toUpperCase()} Plan
                    </span>
                  </div>
                  <span className={`badge badge--${isExpired ? 'danger' : 'success'}`}>
                    {isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <Calendar size={16} />
                    <span>Valid until: <strong>{formatDate(subscription.endDate)}</strong></span>
                  </div>
                  {!isExpired && daysLeft <= 15 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fffbeb', color: '#92400e', borderRadius: '6px', fontSize: '13px' }}>
                      <Clock size={16} />
                      <strong>Expires in {daysLeft} days</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal__section-title" style={{ marginTop: '24px' }}>Clinic Details</div>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                  <Award size={16} style={{ marginTop: '3px' }} />
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>License Number</label>
                    <span>{clinic.licenseNumber || 'Not provided'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                  <Award size={16} style={{ marginTop: '3px' }} />
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Specialization</label>
                    <span>{clinic.specialization || 'General Practice'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                  <Mail size={16} style={{ marginTop: '3px' }} />
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Contact Email</label>
                    <span>{clinic.email || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Owner info */}
            <div>
              <div className="modal__section-title">Owner Information</div>
              {clinic.owner ? (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div className="clinic-cell__avatar" style={{ background: '#f1f5f9' }}>
                      {clinic.owner.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{clinic.owner.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Clinic Owner</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Mail size={16} />
                      <span>{clinic.owner.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Phone size={16} />
                      <span>{clinic.owner.phone || 'No phone added'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>Owner details not available</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Close</button>
          <button className="btn btn--primary" onClick={() => window.open(`mailto:${clinic.owner?.email}`)}>
            <Mail size={16} /> Email Owner
          </button>
        </div>
      </div>
    </div>
  );
}
