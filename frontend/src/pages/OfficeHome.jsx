import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Bell, LogOut, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import Chart from "../components/Chart";

export default function HomePage() {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const issues = [
    { id: 1, title: "Streetlight not working", dept: "Electricity", status: "In Progress", date: "2025-08-20" },
    { id: 2, title: "Potholes on road", dept: "Roads", status: "Pending", date: "2025-08-22" },
    { id: 3, title: "Water supply shortage", dept: "Water", status: "In Progress", date: "2025-08-25" },
    { id: 4, title: "Garbage not collected", dept: "Sanitation", status: "Pending", date: "2025-08-28" },
    { id: 5, title: "Traffic signal issue", dept: "Traffic", status: "Resolved", date: "2025-08-18" },
    { id: 6, title: "Drain blockage", dept: "Sanitation", status: "In Progress", date: "2025-08-24" },
  ];

  // Sorting function
  const sortedIssues = [...issues].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "date") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const lineData = {
    labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    datasets: [
      { label: "Resolved", data: [50, 65, 80, 95, 110, 130], borderColor: "rgba(34,197,94,1)", backgroundColor: "rgba(34,197,94,0.2)", tension: 0.4, fill: true },
      { label: "New Issues", data: [70, 85, 90, 100, 120, 150], borderColor: "rgba(59,130,246,1)", backgroundColor: "rgba(59,130,246,0.2)", tension: 0.4, fill: true },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Overall Issues Trend (Last 6 Months)", font: { size: 16, weight: "bold" }, color: "#1e3a8a" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "rgba(0,0,0,0.05)" } },
    },
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "In Progress", count: 25, color: "bg-blue-500", icon: <Clock className="w-6 h-6" /> },
          { title: "Pending", count: 12, color: "bg-yellow-500", icon: <AlertTriangle className="w-6 h-6" /> },
          { title: "Resolved", count: 58, color: "bg-green-500", icon: <CheckCircle className="w-6 h-6" /> },
          { title: "Rejected", count: 5, color: "bg-red-500", icon: <XCircle className="w-6 h-6" /> },
        ].map((card, i) => (
          <div key={i} className={`${card.color} text-white rounded-xl p-6 shadow-lg flex items-center gap-4 hover:scale-105 transition-transform`}>
            <div>{card.icon}</div>
            <div>
              <h3 className="text-lg font-semibold">{card.title}</h3>
              <p className="text-3xl font-bold">{card.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Department Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-lg font-bold mb-4 text-blue-900">Department Performance</h2>
          <Chart />
        </div>

        {/* Issues Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-blue-900">Current Issues</h2>
          <div className="overflow-y-auto h-[300px]">
            <table className="w-full text-sm min-w-[550px] border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="border-b">
                  <th className="p-2 cursor-pointer" onClick={() => requestSort("title")}>Title</th>
                  <th className="p-2 cursor-pointer" onClick={() => requestSort("dept")}>Dept</th>
                  <th className="p-2 cursor-pointer" onClick={() => requestSort("status")}>Status</th>
                  <th className="p-2 cursor-pointer" onClick={() => requestSort("date")}>Date</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedIssues.map((issue) => (
                  <tr key={issue.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">{issue.title}</td>
                    <td className="p-2">{issue.dept}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        issue.status === "Resolved" ? "bg-green-100 text-green-700" :
                        issue.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-2">{issue.date}</td>
                    <td className="p-2">
                      <select
                        className="border rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        defaultValue={issue.status}
                        onChange={(e) => console.log(`Issue ${issue.id} status updated to ${e.target.value}`)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Overall Trend Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 h-[350px]">
        <Line data={lineData} options={lineOptions} />
      </div>
    </div>
  );
}
