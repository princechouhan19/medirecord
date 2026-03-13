import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import api from "../../../services/api";
import "../styles/dashboard.scss";

const StatCard = ({ label, value, sub, icon, variant }) => (
  <div className={`stat-card stat-card--${variant || "default"}`}>
    <div className="stat-card__header">
      <span className="stat-card__label">{label}</span>
      <div className="stat-card__icon">{icon}</div>
    </div>
    <div className="stat-card__value">{value}</div>
    <div className="stat-card__sub">{sub}</div>
  </div>
);

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState({ count: 0 });
  const [schedule, setSchedule] = useState({ upcoming: 0, overdue: 0 });
  const [patientStats, setPatientStats] = useState({ total: 0, thisWeek: 0 });
  const [trackings, setTrackings] = useState([]);
  const headerRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
    );
    gsap.fromTo(
      ".stat-card",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.2,
      },
    );

    Promise.all([
      api.get("/patients?limit=5"),
      api.get("/reports/count"),
      api.get("/tracking/stats"),
      api.get("/patients/stats"),
      api.get("/tracking"),
    ])
      .then(([p, r, s, ps, t]) => {
        setPatients(p.data.patients?.slice(0, 5) || []);
        setReports(r.data);
        setSchedule(s.data);
        setPatientStats(ps.data);
        setTrackings(t.data.trackings?.slice(0, 3) || []);
      })
      .catch(console.error);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard">
      <div className="dashboard__header" ref={headerRef}>
        <div>
          <h1>Welcome back!</h1>
          <p>Here's an overview of your clinic's activity today</p>
        </div>
        <div className="dashboard__date">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="16"
            height="16"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          {dateStr}
        </div>
      </div>

      <div className="dashboard__stats" ref={statsRef}>
        <StatCard
          label="Total Patients"
          value={patientStats.total}
          sub={`+${patientStats.thisWeek} this week`}
          icon="👥"
        />
        <StatCard
          label="Reports Generated"
          value={reports.count}
          sub="All up to date"
          icon="📄"
        />
        <StatCard
          label="Upcoming Visits"
          value={schedule.upcoming}
          sub="Next 7 days"
          icon="📅"
        />
        <StatCard
          label="Overdue Visits"
          value={schedule.overdue}
          sub="Needs attention"
          icon="⚠️"
          variant="danger"
        />
      </div>

      <div className="dashboard__panels">
        <div className="card dashboard__recent">
          <div className="panel-header">
            <h3>Recent Patients</h3>
            <Link to="/registration" className="panel-link">
              View all →
            </Link>
          </div>
          <div className="patient-list">
            {patients.map((p) => (
              <div key={p._id} className="patient-row">
                <div className="patient-row__avatar">{p.name[0]}</div>
                <div className="patient-row__info">
                  <span className="patient-row__name">{p.name}</span>
                  <span className="patient-row__meta">
                    {p.gender}, {p.age} yrs — {p.testType}
                  </span>
                </div>
                <span className="patient-row__phone">{p.phone}</span>
              </div>
            ))}
            {patients.length === 0 && (
              <p className="empty-state">
                No patients yet. <Link to="/registration">Register one →</Link>
              </p>
            )}
          </div>
        </div>

        <div className="card dashboard__schedule">
          <div className="panel-header">
            <h3>Visit Schedule</h3>
            <Link to="/tracking" className="panel-link">
              View all →
            </Link>
          </div>
          <div className="schedule-list">
            {trackings.map((t) => (
              <div
                key={t._id}
                className={`schedule-row ${t.status === "Overdue" ? "schedule-row--overdue" : ""}`}
              >
                <div className="patient-row__avatar">
                  {t.patient?.name?.[0] || "P"}
                </div>
                <div className="schedule-row__info">
                  <span className="patient-row__name">{t.patient?.name}</span>
                  <span className="patient-row__meta">{t.purpose}</span>
                </div>
                <div className="schedule-row__right">
                  {t.status === "Overdue" ? (
                    <span className="badge badge--danger">Overdue</span>
                  ) : (
                    <span className="schedule-row__date">
                      {new Date(t.nextVisit).toLocaleDateString("en-CA")}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {trackings.length === 0 && (
              <p className="empty-state">No scheduled visits.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
