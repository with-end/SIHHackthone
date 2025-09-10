import { useEffect, useState } from "react";
import axios from "axios";

export default function OfficerDashboard({ officerId }) {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("inactive");
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/officer/${officerId}/reports`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function updateStatus(newStatus) {
    setStatus(newStatus);
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/officer/${officerId}/status`, { status: newStatus });
    fetchReports();
  }

  async function approveReport(reportId) {
    setApproveLoading(reportId);
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/officer/${officerId}/reports/${reportId}/approve`);
    setApproveLoading(null);
    fetchReports();
  }

  const pendingReports = reports.filter(r => r.status === "submitted").length;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Officer Dashboard</h1>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-3">
          <span className="font-semibold">Status: 
            <span className={`ml-2 ${status === "active" ? "text-green-300" : "text-red-300"}`}>
              {status.toUpperCase()}
            </span>
          </span>
          <button
            onClick={() => updateStatus("active")}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded shadow transition text-white font-medium"
          >
            Set Active
          </button>
          <button
            onClick={() => updateStatus("inactive")}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded shadow transition text-white font-medium"
          >
            Set Inactive
          </button>
        </div>
      </div>

      {/* Pending Reports Badge */}
      <div className="flex justify-end mb-4">
        <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow">
          Pending Reports: {pendingReports}
        </span>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-white shadow-lg rounded-lg p-5 flex flex-col justify-between hover:shadow-2xl transition duration-300">
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{r.title}</h3>
                <p className="text-gray-700 mb-2">{r.description}</p>
                <p className="font-semibold">
                  Status: 
                  <span className={`ml-2 ${r.status === "submitted" ? "text-yellow-500" : r.status === "processing" ? "text-blue-500" : "text-green-500"}`}>
                    {r.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <button
                onClick={() => approveReport(r._id)}
                disabled={approveLoading === r._id}
                className={`mt-4 px-4 py-2 rounded text-white font-medium shadow transition ${
                  approveLoading === r._id ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {approveLoading === r._id ? "Approving..." : "Approve"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
