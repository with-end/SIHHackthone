import React from "react";
import { Clock, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function NagarpalikaDashboard() {
  // Chart Data
  const deptData = {
    labels: ["Road", "Electricity", "Water", "Sanitation"],
    datasets: [
      {
        label: "Resolved",
        data: [20, 15, 18, 25],
        backgroundColor: "rgba(34,197,94,0.8)", // green
      },
      {
        label: "Pending",
        data: [5, 8, 3, 2],
        backgroundColor: "rgba(234,179,8,0.8)", // yellow
      },
    ],
  };

  const deptOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Department Performance" },
    },
  };

  const issueData = {
    labels: ["Pending", "In Progress", "Resolved", "Rejected"],
    datasets: [
      {
        label: "Issues",
        data: [12, 8, 20, 5],
        backgroundColor: [
          "rgba(234,179,8,0.8)", // yellow
          "rgba(59,130,246,0.8)", // blue
          "rgba(34,197,94,0.8)", // green
          "rgba(239,68,68,0.8)", // red
        ],
      },
    ],
  };

  const issueOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Overall Issues Status" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4 rounded-lg mb-6 border-b-4 border-blue-600">
        <h1 className="text-2xl font-bold text-blue-800">🏛️ Nagarpalika Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-700">Officer: Rajesh Sharma</span>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Logout</button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center gap-3 border-t-4 border-yellow-500">
          <Clock className="text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">Pending Complaints</p>
            <h2 className="text-xl font-bold">12</h2>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center gap-3 border-t-4 border-blue-500">
          <BarChart3 className="text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">In Progress</p>
            <h2 className="text-xl font-bold">8</h2>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center gap-3 border-t-4 border-green-500">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Resolved</p>
            <h2 className="text-xl font-bold">20</h2>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex items-center gap-3 border-t-4 border-red-500">
          <XCircle className="text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Rejected</p>
            <h2 className="text-xl font-bold">5</h2>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">📋 Complaints List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Citizen</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Location</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="p-2 border">#101</td>
                <td className="p-2 border">Ravi Kumar</td>
                <td className="p-2 border">Road</td>
                <td className="p-2 border">Sector 14</td>
                <td className="p-2 border text-yellow-600 font-medium">Pending</td>
                <td className="p-2 border">29 Aug 2025</td>
                <td className="p-2 border">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600">View</button>
                  <button className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Assign</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-2 border">#102</td>
                <td className="p-2 border">Priya Singh</td>
                <td className="p-2 border">Electricity</td>
                <td className="p-2 border">Sector 7</td>
                <td className="p-2 border text-blue-600 font-medium">In Progress</td>
                <td className="p-2 border">28 Aug 2025</td>
                <td className="p-2 border">
                  <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600">View</button>
                  <button className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Assign</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">📊 Department Performance</h2>
          <Bar data={deptData} options={deptOptions} />
        </div>

        {/* Issues Performance */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">📈 Issues Overview</h2>
          <Bar data={issueData} options={issueOptions} />
        </div>
      </div>
    </div>
  );
}
