import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import api from "../../../services/api";
import "../styles/admin.scss";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalClinics: 0,
    activeClinics: 0,
    totalPatients: 0,
    totalUsers: 0,
  });
  const [clinics, setClinics] = useState([]);
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
    );
    gsap.fromTo(
      ".admin-stat",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, delay: 0.2, duration: 0.5 },
    );
    Promise.all([api.get("/clinics/stats"), api.get("/clinics")])
      .then(([s, c]) => {
        setStats(s.data);
        setClinics(c.data.clinics?.slice(0, 6) || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header" ref={headerRef}>
        <div>
          <h1>Super Admin Panel</h1>
          <p>Platform-wide overview and management</p>
        </div>
        <Link to="/admin/clinics" className="btn btn--primary">
          + Register New Clinic
        </Link>
      </div>

      <div className="admin-stats">
        {[
          {
            label: "Total Clinics",
            value: stats.totalClinics,
            icon: "🏥",
            color: "blue",
          },
          {
            label: "Active Clinics",
            value: stats.activeClinics,
            icon: "✅",
            color: "green",
          },
          {
            label: "Total Patients",
            value: stats.totalPatients,
            icon: "👥",
            color: "teal",
          },
          {
            label: "Total Users",
            value: stats.totalUsers,
            icon: "👤",
            color: "purple",
          },
        ].map((s) => (
          <div key={s.label} className={`admin-stat admin-stat--${s.color}`}>
            <div className="admin-stat__icon">{s.icon}</div>
            <div className="admin-stat__value">{s.value}</div>
            <div className="admin-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card admin-clinics-table">
        <div className="panel-header">
          <h3>Recent Clinics</h3>
          <Link to="/admin/clinics" className="panel-link">
            View all →
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>CLINIC NAME</th>
              <th>OWNER</th>
              <th>PLAN</th>
              <th>PATIENTS</th>
              <th>STAFF</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr key={c._id}>
                <td className="td-name">{c.name}</td>
                <td className="td-muted">{c.owner?.name}</td>
                <td>
                  <span
                    className={`badge badge--${c.plan === "enterprise" ? "warning" : "primary"}`}
                  >
                    {c.plan}
                  </span>
                </td>
                <td>{c._patientCount || 0}</td>
                <td>{c._staffCount || 0}</td>
                <td>
                  <span
                    className={`badge badge--${c.isActive ? "success" : "danger"}`}
                  >
                    {c.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
              </tr>
            ))}
            {clinics.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  No clinics registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
