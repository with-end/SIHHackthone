import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PublicHome() {
  const { t } = useTranslation();

  const [issues] = useState([
    { id: "ISSUE-101", title: t("streetlightIssue"), status: "inProgress", department: "electricity", date: "2025-08-25", email: "user1@example.com" },
    { id: "ISSUE-102", title: t("potholeIssue"), status: "notApproved", department: "roads", date: "2025-08-27", email: "user2@example.com" },
    { id: "ISSUE-103", title: t("garbageIssue"), status: "inProgress", department: "sanitation", date: "2025-08-28", email: "user3@example.com" },
    { id: "ISSUE-104", title: t("waterLeakIssue"), status: "inProgress", department: "water", date: "2025-08-29", email: "user4@example.com" },
    { id: "ISSUE-105", title: t("brokenBenchIssue"), status: "notApproved", department: "parks", date: "2025-08-30", email: "user5@example.com" },
  ]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const statuses = ["all", "inProgress", "notApproved"];
  const departments = ["all", "electricity", "roads", "sanitation", "water", "parks"];

  const filteredIssues = issues.filter(
    (issue) =>
      (statusFilter === "all" || issue.status === statusFilter) &&
      (departmentFilter === "all" || issue.department === departmentFilter)
  );

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500">
        {t("currentIssues")}
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <select
          className="flex-1 px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>{t(status)}</option>
          ))}
        </select>

        <select
          className="flex-1 px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>{t(dept)}</option>
          ))}
        </select>
      </div>

      {/* Issues List */}
      <div className="flex flex-col gap-5 sm:gap-6 md:gap-8 overflow-y-auto">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6 md:p-8 border border-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition duration-300 relative overflow-hidden group"
            >
              {/* Hover overlay effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-indigo-200 via-pink-200 to-yellow-200 opacity-0 group-hover:opacity-20 transition duration-500 rounded-2xl sm:rounded-3xl"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                {/* Text Info */}
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 truncate">
                    {issue.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">
                    <span className="font-semibold">{t("id")}:</span> {issue.id}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">
                    <span className="font-semibold">{t("department")}:</span> {t(issue.department)}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700">
                    <span className="font-semibold">{t("submittedOn")}:</span> {issue.date}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 truncate">
                    <span className="font-semibold">{t("submittedBy")}:</span> {issue.email}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span
                    className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium ${
                      issue.status === "inProgress"
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-md"
                        : "bg-gradient-to-r from-red-300 to-red-500 text-red-900 shadow-md"
                    }`}
                  >
                    {t(issue.status)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm sm:text-lg">{t("noReports")}</p>
        )}
      </div>
    </div>
  );
}
