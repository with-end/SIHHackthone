import { useState } from "react";

export default function TrackIssue() {
  const [issues] = useState([
    {
      id: "ISSUE-101",
      title: "Streetlight not working",
      department: "Electricity",
      submittedDate: "2025-08-25",
      approvedDate: "2025-08-26",
      inProgressDate: "2025-08-27",
      completedDate: "",
      email: "user1@example.com",
      description: "Streetlight near park is not functioning, causing safety issues at night.",
    },
    {
      id: "ISSUE-102",
      title: "Pothole on main road",
      department: "Roads",
      submittedDate: "2025-08-27",
      approvedDate: "",
      inProgressDate: "",
      completedDate: "",
      email: "user2@example.com",
      description: "Large pothole causing traffic issues near main junction.",
    },
  ]);

  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = () => {
    const found = issues.find((issue) => issue.id.toLowerCase() === searchId.toLowerCase());
    setResult(found || { notFound: true });
  };

  // List of stages
  const stages = ["Submitted", "Approved", "In Progress", "Completed"];

  // Get date for a stage
  const getDate = (stage) => {
    switch (stage) {
      case "Submitted":
        return result.submittedDate || "--";
      case "Approved":
        return result.approvedDate || "--";
      case "In Progress":
        return result.inProgressDate || "--";
      case "Completed":
        return result.completedDate || "--";
      default:
        return "--";
    }
  };

  // Check if stage is active
  const isActive = (stage) => {
    const date = getDate(stage);
    return date && date !== "--";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8 flex flex-col items-center">
      <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500">
        Track Your Issue
      </h2>

      {/* Search Box */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 w-full max-w-xl">
        <input
          type="text"
          placeholder="Enter Issue ID (e.g., ISSUE-101)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-lg font-semibold shadow-md hover:from-pink-500 hover:to-yellow-500 transition"
        >
          Track
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 relative">
          {result.notFound ? (
            <p className="text-red-500 text-lg font-semibold">No issue found with ID "{searchId}"</p>
          ) : (
            <>
              {/* Issue Details */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-indigo-700">{result.title}</h3>
                <p className="text-gray-700 mt-2"><span className="font-semibold">ID:</span> {result.id}</p>
                <p className="text-gray-700 mt-1"><span className="font-semibold">Department:</span> {result.department}</p>
                <p className="text-gray-700 mt-1"><span className="font-semibold">Submitted by:</span> {result.email}</p>
                <p className="text-gray-700 mt-2"><span className="font-semibold">Description:</span> {result.description}</p>
              </div>

              {/* Progress Tracker */}
              <div className="relative flex justify-between items-center">
                {/* Horizontal Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 z-0 rounded-full"></div>
                <div className="absolute top-5 left-0 right-0 h-1 bg-indigo-500 z-0 rounded-full"
                  style={{
                    width: `${(stages.filter(isActive).length - 1) / (stages.length - 1) * 100}%`,
                    transition: "width 0.5s"
                  }}
                ></div>

                {stages.map((stage, index) => (
                  <div key={stage} className="relative flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        isActive(stage)
                          ? "bg-gradient-to-r from-indigo-500 to-pink-500 shadow-lg"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="mt-2 text-sm font-medium text-center">{stage}</span>
                    <span className="mt-1 text-xs text-gray-600">{getDate(stage)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
