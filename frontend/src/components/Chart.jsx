import { Bar } from "react-chartjs-2";

export default function Chart({ deptSummary, statusCounts, type }) {
  let data;

  if (type === "department") {
    // office view
    data = {
      labels: Object.keys(deptSummary),
      datasets: [
        {
          label: "Resolved",
          data: Object.values(deptSummary).map(d => d.resolved),
          backgroundColor: "rgba(34,197,94,0.7)",
        },
        {
          label: "Pending",
          data: Object.values(deptSummary).map(d => d.pending),
          backgroundColor: "rgba(239,68,68,0.7)",
        },
      ],
    };
  } else {
    // department view
    data = {
      labels: ["Pending", "In Progress", "Completed", "Approved", "Rejected"],
      datasets: [
        {
          label: "Reports",
          data: [
            statusCounts.pending || 0,
            statusCounts["inprogress"] || 0,
            statusCounts.completed || 0,
            statusCounts.approved || 0,
            statusCounts.rejected || 0,
          ],
          backgroundColor: [
            "rgba(255, 206, 86, 0.7)", // yellow
            "rgba(54, 162, 235, 0.7)",   // blue
            "rgba(75, 192, 192, 0.7)",
            "rgba(34,197,94,0.7)",  // green
            "rgba(239,68,68,0.7)",
          ],
        },
      ],
    };
  }

  return <Bar data={data} />;
}
