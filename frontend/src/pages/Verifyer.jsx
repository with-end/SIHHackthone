import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import io from 'socket.io-client';



export default function OfficerDashboard() {
  const location = useLocation();
  const { officer } = location.state || {};
  const officerId = officer ? officer._id : null ;
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState(officer && officer.status!=="inactive" ? "active" : "inactive") ;
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(null);

  useEffect(() => {        
    console.log(officer) ;
    fetchReports();
  }, []);

 
  useEffect(() => {
          const socket = io('http://localhost:3000') ;

          socket.on('assigned', (report) => {
             if( report.assignedOfficer === officerId ){
               setReports(prev => [...prev , report]) ;
               console.log("new report assigned" , report) ;  
             }
           });
    
        return () => {
          socket.off('assigned');
        };
      }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/officer/${officerId}/reports`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function updateStatus(newStatus){
    setStatus(newStatus);
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/officer/${officerId}/status`, { status: newStatus });
    fetchReports();
  }

  async function approveReport(reportId) {
    setApproveLoading(reportId);
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/officer/${officerId}/reports/${reportId}/approve`);
    setApproveLoading(null);
    setReports((prev) => prev.filter((r) => r._id !== reportId)); // remove approved report from list 
  }

  const pendingReports = reports.filter(r => r.status === "pending").length;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Officer Dashboard</h1>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-3">
          <span className="font-semibold">
            Status: 
            <span className={`ml-2 font-bold ${status === "active" ? "text-green-300" : "text-red-300"}`}>
              {status.toUpperCase()}
            </span>
          </span>
          <button
            onClick={() => updateStatus("active")}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl shadow text-white font-medium transition"
          >
            Set Active
          </button>
          <button
            onClick={() => updateStatus("inactive")}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-xl shadow text-white font-medium transition"
          >
            Set Inactive
          </button>
        </div>
      </div>

      {/* Pending Reports Badge */}
      <div className="flex justify-end mb-6">
        <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-full shadow-lg">
          Pending Reports: {pendingReports}
        </span>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading reports...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <div 
              key={r._id} 
              className="bg-white shadow-lg rounded-xl p-5 flex flex-col justify-between transform hover:scale-105 transition duration-300"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{r.title}</h3>
                <p className="text-gray-700 mb-3">{r.description}</p>
                <span className={`inline-block px-2 py-1 text-sm rounded-full font-semibold ${
                  r.status === "submitted" ? "bg-yellow-200 text-yellow-800" :
                  r.status === "processing" ? "bg-blue-200 text-blue-800" :
                  "bg-green-200 text-green-800"
                }`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => approveReport(r._id)}
                disabled={approveLoading === r._id}
                className={`mt-4 px-4 py-2 rounded-xl text-white font-medium shadow transition ${
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
