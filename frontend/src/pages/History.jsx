import { useState } from "react";

export default function History() {
  const [issues] = useState([
    { id: "ISSUE-101", title: "Streetlight not working", status: "Completed", department: "Electricity", submittedDate: "2025-08-25", completedDate: "2025-08-28", description: "Streetlight near park is not functioning." },
    { id: "ISSUE-102", title: "Pothole on main road", status: "Completed", department: "Roads", submittedDate: "2025-08-27", completedDate: "2025-08-30", description: "Large pothole causing traffic issues near main junction." },
    { id: "ISSUE-103", title: "Garbage not collected", status: "Completed", department: "Sanitation", submittedDate: "2025-08-28", completedDate: "2025-08-31", description: "Garbage not collected in zone 3." },
    { id: "ISSUE-104", title: "Water leakage", status: "Completed", department: "Water", submittedDate: "2025-08-29", completedDate: "2025-08-31", description: "Pipe leakage near main street." },
  ]);

  const [searchId, setSearchId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Get unique departments
  const departments = [...new Set(issues.map(issue => issue.department))];

  // Filter issues based on search
  const filteredIssues = issues.filter(
    issue =>
      issue.status === "Completed" &&
      issue.id.toLowerCase().includes(searchId.toLowerCase()) &&
      (selectedDepartment === "" || issue.department === selectedDepartment)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <h2 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500">
        Solved Issues History
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Search by Issue ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="">All Departments</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Issue Cards */}
      {filteredIssues.length === 0 ? (
        <p className="text-gray-500 text-lg">No completed issues found.</p>
      ) : (
        <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          {filteredIssues.map((issue, index) => (
            <div key={index} className="w-full bg-white rounded-3xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold text-indigo-700">{issue.title}</h3>
                  <p className="text-gray-700"><span className="font-semibold">ID:</span> {issue.id}</p>
                  <p className="text-gray-700"><span className="font-semibold">Department:</span> {issue.department}</p>
                  <p className="text-gray-700"><span className="font-semibold">Submitted on:</span> {issue.submittedDate}</p>
                  <p className="text-gray-700"><span className="font-semibold">Completed on:</span> {issue.completedDate}</p>
                  <p className="text-gray-700"><span className="font-semibold">Description:</span> {issue.description}</p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span className="px-6 py-3 rounded-full text-sm font-medium bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                    {issue.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
