
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
   Filler, 
} from "chart.js";

import { Bell, LogOut, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import Chart from "../components/Chart";
import io from 'socket.io-client' ;

// Register once (fixes "point not registered" error)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend ,
   Filler, 
);


export default function HomePage({ mode }) {
  let variable = mode ;
  if( mode=="department"){ 
    const {deptId} = useParams() ; 
    variable = deptId ;
    console.log(variable) ;
  }
  const nagarId = localStorage.getItem("nagarId");

  const [issues, setIssues] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [deptSummary, setDeptSummary] = useState({});
  const [trendData, setTrendData] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika/home/${variable}?nagarId=${nagarId}`);
        console.log(res) ;
        setIssues(res.data.reports || []);
        setStatusCounts(res.data.statusCounts || {});
        setDeptSummary(res.data.deptSummary || {});
        setTrendData(res.data.trendData || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [variable, nagarId]);



  // handle the status of the report 
 const handleStatus = (reportId, prevStatus, department) => async (event) => {
  const newStatus = event.target.value;
  try {
    // Backend call
    await axios.patch(
      `${import.meta.env.VITE_BACKEND_URL}/reports/${reportId}/status`,
      { status: newStatus }
    );

    // Update issues list
    setIssues(prevIssues =>
      prevIssues.map(issue =>
        issue._id === reportId ? { ...issue, status: newStatus } : issue
      )
    );


    // Update status counts
    setStatusCounts(prevCounts => {                                          
      const updated = { ...prevCounts };
      if (prevStatus ) {
        updated[prevStatus] = Math.max(0, updated[prevStatus] - 1);
      }
      if (updated[newStatus] !== undefined) {
        updated[newStatus] = updated[newStatus] + 1;
      }
      return updated;
    });

    // Update department summary (only if in office mode)
    if (variable === "office") {
      setDeptSummary(prevSummary => {
  if (!prevSummary[department]) return prevSummary;

  const updated = {
    ...prevSummary,
    [department]: { ...prevSummary[department] }  // deep copy dept object
  };

  // pending bucket
  if (["pending", "inprogress", "approved"].includes(prevStatus)) {
    updated[department].pending = Math.max(0, updated[department].pending - 1);
  }
  if (["pending", "inprogress", "approved"].includes(newStatus)) {
    updated[department].pending += 1;
  }

  // resolved bucket
  if (prevStatus === "completed") {
    updated[department].resolved = Math.max(0, updated[department].resolved - 1);
  }
  if (newStatus === "completed") {
    updated[department].resolved += 1;
  }

  return updated;
});
    }
  } catch (err) {
    console.error(err);
    alert("Failed to update report status");
  }
};


  // ✅ Sorting logic
  const sortedIssues = [...issues].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === "submissionDate") {
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


  // for real-time updates using socket.io 
  useEffect(() => {
           const socket = io(import.meta.env.VITE_BACKEND) ;

          socket.on('assigned', (report) => {
              console.log(report) ;
              if( report.nagarId === nagarId && ( variable==="office" || report.department === variable )){
                setIssues(prev => [...prev , report]) ;
                // update status counts 
                setStatusCounts(prevCounts => {
                  const updated = { ...prevCounts };
                  if(updated["pending"] !== undefined){
                    updated["pending"] = updated["pending"]+1 ;
                    return updated ;
                  }
                })
                
              }
           });
    
        return () => {
          socket.off('assigned');
        };
      }, []);


  // ✅ Trend chart
  const lineData = {
    labels: Object.keys(trendData),
    datasets: [
      {
        label: "Resolved",
        data: Object.values(trendData).map(d => d.completed),
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "New Issues",
        data: Object.values(trendData).map(d => d.new),
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Overall Issues Trend (Last 6 Months)",
        font: { size: 16, weight: "bold" },
        color: "#1e3a8a",
      },
    },
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-100 min-h-screen">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "In Progress", count: statusCounts["inprogress"] || 0, color: "bg-blue-500", icon: <Clock className="w-6 h-6" /> },
          { title: "Approved", count: statusCounts.approved || 0, color: "bg-yellow-500", icon: <AlertTriangle className="w-6 h-6" /> },
          { title: "Resolved", count: statusCounts.completed || 0, color: "bg-green-500", icon: <CheckCircle className="w-6 h-6" /> },
          { title: "Pending", count: statusCounts.pending || 0, color: "bg-red-500", icon: <XCircle className="w-6 h-6" /> },
        ].map((card, i) => (
          <div key={i} className={`${card.color} text-white rounded-xl p-6 shadow-lg flex items-center gap-4`}>
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
        {/* Left side chart (office = dept summary, department = status chart) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
          {variable === "office" ? (
            <Chart deptSummary={deptSummary} type="department" />
          ) : (
            <Chart statusCounts={statusCounts} type="status" />
          )}
        </div>

        {/* Issues Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col">
           <p
  className="pb-2 cursor-pointer select-none flex items-center gap-1 text-amber-700 hover:text-blue-500 transition-colors duration-200"
  onClick={() => requestSort("priority")}
>
  Priority
  {/* Show arrow based on current sort */}
  {sortConfig.key === "priority" && (
    <span className="text-sm">
      {sortConfig.direction === "asc" ? "▲" : "▼"}
    </span>
  )}
</p>
          <h2 className="text-lg font-bold mb-4 text-blue-900">Current Issues</h2>
          <div className="overflow-y-auto h-[300px]">
           

            <table className="w-full text-sm min-w-[550px] border-collapse">
             
<thead className="bg-gray-50 sticky top-0 z-10">
  <tr className="border-b">
    <th className="p-2 cursor-pointer" onClick={() => requestSort("title")}>Title</th>
    <th className="p-2 cursor-pointer" onClick={() => requestSort("department")}>Dept</th>
    <th className="p-2 cursor-pointer" onClick={() => requestSort("status")}>Status</th>
    <th className="p-2 cursor-pointer" onClick={() => requestSort("submissionDate")}>Date</th>
    <th className="p-2">Action</th>
  </tr>
</thead>

              <tbody>
                {sortedIssues.map((issue) => (
                  <tr key={issue._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">{issue.title}</td>
                    <td className="p-2">{issue.department}</td>
                    <td className="p-2">
                      <span
                       className={`px-2 py-1 text-xs rounded-full font-semibold
                    ${
      issue.status === "pending"
        ? "bg-red-100 text-red-700"
        : issue.status === "approved"
        ? "bg-yellow-100 text-yellow-700"
        : issue.status === "inprogress"
        ? "bg-blue-100 text-blue-700"
        : issue.status === "completed"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-700"
    }`}
>
  {issue.status}
</span>
                    </td>
                    <td className="p-2">{new Date(issue.submissionDate).toLocaleDateString()}</td>
                    <td className="p-2">
                      <select
                        className="border rounded-lg px-2 py-1 text-sm"
                        defaultValue={issue.status}
                        onChange={(e) => handleStatus(issue._id, issue.status, issue.department)(e)}
                      >
                        <option value="pending">Pending</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="approved">Approved</option>
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
