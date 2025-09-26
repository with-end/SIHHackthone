import React from "react";

export default function ReportPreview() {
  const report = {
    reporterEmail: "akash@example.com",
    department: "Public Works",
    nagarId: "NP-123",
    title: "Broken Street Light",
    description:
      "The street light near the market is broken and needs urgent repair. Needs urgent action from the authorities to ensure public safety.",
    imageUrl: "https://via.placeholder.com/600x300",
    location: { coordinates: [79.114851, 24.818328] },
    status: "inprogress",
    reportId: "REP-456",
    priority: 2, // 1-low, 2-medium, 3-high
    submissionDate: "2025-09-26",
    approvalDate: "2025-09-27",
    inprogressDate: "2025-09-28",
    completionDate: "",
  };

  const statusColors = {
    pending: "#FFA500",
    inprogress: "#1E90FF",
    approved: "#28a745",
    completed: "#6c757d",
  };

  const priorityColors = {
    0: "#6c757d", // none
    1: "#28a745", // low
    2: "#FFC107", // medium
    3: "#dc3545", // high
  };

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "40px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* Image */}
        {report.imageUrl && (
          <img
            src={report.imageUrl}
            alt="Report"
            style={{ width: "100%", maxHeight: "350px", objectFit: "cover" }}
          />
        )}

        {/* Content */}
        <div style={{ padding: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, color: "#222" }}>{report.title}</h2>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: statusColors[report.status],
                color: "#fff",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "0.85rem",
              }}
            >
              {report.status}
            </span>
          </div>

          <p style={{ color: "#555", lineHeight: "1.6", marginTop: "15px" }}>
            {report.description}
          </p>

          {/* Reporter & Department */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <InfoRow label="Reporter" value={report.reporterEmail} />
            <InfoRow label="Department" value={report.department} />
            <InfoRow label="Nagar ID" value={report.nagarId} />
            <InfoRow label="Report ID" value={report.reportId} />
          </div>

          <hr style={{ margin: "25px 0", borderColor: "#eee" }} />

          {/* Location & Priority */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <InfoRow
              label="Location"
              value={`Lng: ${report.location.coordinates[0]}, Lat: ${report.location.coordinates[1]}`}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong>Priority:</strong>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  backgroundColor: priorityColors[report.priority],
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                {["None", "Low", "Medium", "High"][report.priority] || "None"}
              </span>
            </div>
          </div>

          <hr style={{ margin: "25px 0", borderColor: "#eee" }} />

          {/* Dates */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <InfoRow label="Submission Date" value={report.submissionDate} />
            <InfoRow label="Approval Date" value={report.approvalDate || "N/A"} />
            <InfoRow label="In Progress Date" value={report.inprogressDate || "N/A"} />
            <InfoRow label="Completion Date" value={report.completionDate || "N/A"} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for label-value row
function InfoRow({ label, value }) {
  return (
    <div style={{ minWidth: "200px", color: "#333" }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}
