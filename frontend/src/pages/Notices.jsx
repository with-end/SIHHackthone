import { useState } from "react";

export default function Notices() {
  const [notices] = useState([
    {
      id: "NOTICE-001",
      title: "Water supply interruption",
      description: "Water supply will be disrupted in your area on 2025-09-01 from 8 AM to 5 PM.",
      date: "2025-08-30",
      department: "Water",
      type: "Important",
    },
    {
      id: "NOTICE-002",
      title: "Road repair work",
      description: "Main Street will be closed for maintenance on 2025-09-03. Please use alternate routes.",
      date: "2025-08-28",
      department: "Roads",
      type: "Update",
    },
    {
      id: "NOTICE-003",
      title: "Garbage collection change",
      description: "Garbage collection schedule will be changed on 2025-09-02. Check your local zone timings.",
      date: "2025-08-27",
      department: "Sanitation",
      type: "Info",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <h2 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500">
        Latest Notices
      </h2>

      <div className="flex flex-col gap-6 min-h-[80vh] overflow-y-auto">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="w-full bg-white rounded-3xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 relative overflow-hidden group"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-indigo-200 via-pink-200 to-yellow-200 opacity-0 group-hover:opacity-20 transition duration-500 rounded-3xl"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold text-indigo-700">{notice.title}</h3>
                <p className="text-gray-700">{notice.description}</p>
                <p className="text-gray-700">
                  <span className="font-semibold">Department:</span> {notice.department}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Date:</span> {notice.date}
                </p>
              </div>

              {/* Type badge on the right */}
              <div className="flex-shrink-0">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    notice.type === "Important"
                      ? "bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md"
                      : notice.type === "Update"
                      ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md"
                      : "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md"
                  }`}
                >
                  {notice.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
