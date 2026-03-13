import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportingService } from "../services/reporting.service";
import { ChevronLeft } from "lucide-react";
import "../styles/ReportingPage.scss";

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportingService
      .getReport(id)
      .then((res) => setReport(res.data.report))
      .catch(() => navigate("/reporting"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div style={{ padding: "40px", color: "#8aada7" }}>Loading report...</div>
    );
  if (!report) return null;

  const p = report.patient;

  return (
    <div className="report-detail">
      <div
        className="report-detail__back"
        onClick={() => navigate("/reporting")}
      >
        <ChevronLeft size={16} /> Back to Reports
      </div>

      <div className="report-detail__card">
        <h1 className="report-detail__title">{report.reportType} Report</h1>
        <p className="report-detail__meta">
          Patient: <strong>{p?.name}</strong> &nbsp;·&nbsp;
          {p?.age} yrs, {p?.gender} &nbsp;·&nbsp; Generated:{" "}
          {new Date(report.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <hr className="report-detail__divider" />

        <div className="report-detail__section">
          <h4>Diagnosis</h4>
          <p>{report.diagnosis || "—"}</p>
        </div>

        {report.findings && (
          <div className="report-detail__section">
            <h4>Findings</h4>
            <p>{report.findings}</p>
          </div>
        )}

        {report.recommendations && (
          <div className="report-detail__section">
            <h4>Recommendations</h4>
            <p>{report.recommendations}</p>
          </div>
        )}

        {report.attachments?.length > 0 && (
          <div className="report-detail__section">
            <h4>Attachments</h4>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              {report.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    width: "120px",
                    height: "90px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e2edeb",
                  }}
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
