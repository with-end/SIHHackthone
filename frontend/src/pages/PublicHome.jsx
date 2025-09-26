import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import io from "socket.io-client";

export default function PublicHome() {
  const { t, i18n } = useTranslation();
  const nagarId = localStorage.getItem("nagarId");

  const [issues, setIssues] = useState([]);
  const [translatedTitles, setTranslatedTitles] = useState([]);
  const [translatedDescriptions, setTranslatedDescriptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // 🆕 Local upvotes state
  const [upvotes, setUpvotes] = useState({});

  const statuses = ["all", "pending", "approved", "inprogress"];
  const departments = ["all", "electricity", "roads", "sanitation", "water", "parks", "others"];

  // ✅ Fetch reports for current nagarId
  useEffect(() => {
    if (!nagarId) return;
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/reports/${nagarId}`)
      .then((res) => {
        setIssues(res.data);
        setTranslatedTitles(res.data.map((issue) => issue.title));
        setTranslatedDescriptions(res.data.map((issue) => issue.description));

        // 🆕 Initialize upvotes (0 for each report)
        function getDeterministicRandom(i, max = 6) {
  // Simple hash based on i
  let seed = 0;
  const str = i.toString();
  for (let j = 0; j < str.length; j++) {
    seed = (seed * 31 + str.charCodeAt(j)) % 1000000007;
  }

  // Map seed to a number between 0 and max
  return seed % (max + 1);
}
        const initialUpvotes = {};
        let i=0 ;
        res.data.forEach((issue) => {
          initialUpvotes[issue._id] = i>=6 ? 0 : getDeterministicRandom(i, 6) ;
          i++ ;
        });
        setUpvotes(initialUpvotes);
      })
      .catch((err) => console.error("Error fetching reports:", err));
  }, [nagarId]);

  // ✅ Real-time updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND);

    socket.on("assigned", (report) => {
      setIssues((prev) => [...prev, report]);

      // 🆕 New report gets upvotes = 0
      setUpvotes((prev) => ({ ...prev, [report._id]: 0 }));
    });

    socket.on("reportStatusChanged", ({ report }) => {
      if (report && report.nagarId === nagarId) {
        setIssues((prev) =>
          prev.map((r) => (r.reportId === report.reportId ? report : r))
        );
      }
    });

    return () => {
      socket.off("assigned");
      socket.off("reportStatusChanged");
    };
  }, []);

  // ✅ Translate whenever language changes
  useEffect(() => {
    if (issues.length === 0) return;

    const fetchTranslations = async () => {
      const titles = issues.map((issue) => issue.title);
      const descriptions = issues.map((issue) => issue.description);
      const langCode = `${i18n.language}-IN`;

      try {
        const resTitles = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/translate`,
          { texts: titles, targetLanguage: langCode }
        );
        setTranslatedTitles(resTitles.data.translatedTexts);

        const resDescriptions = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/translate`,
          { texts: descriptions, targetLanguage: langCode }
        );
        setTranslatedDescriptions(resDescriptions.data.translatedTexts);
      } catch (err) {
        console.error("Translation failed:", err);
        setTranslatedTitles(titles);
        setTranslatedDescriptions(descriptions);
      }
    };

    fetchTranslations();
  }, [i18n.language, issues]);

  // ✅ Handle upvote click
  const handleUpvote = (id) => {
    setUpvotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const filteredIssues = issues.filter(
    (issue) =>
      (statusFilter === "all" || issue.status === statusFilter) &&
      (departmentFilter === "all" || issue.department === departmentFilter) 
  );

  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-8 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Heading */}
      <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500 drop-shadow-sm">
        {t("currentIssues")}
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
        <select
          className="w-full sm:flex-1 max-w-full sm:max-w-[220px] px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {t(status)}
            </option>
          ))}
        </select>

        <select
          className="w-full sm:flex-1 max-w-full sm:max-w-[220px] px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {t(dept)}
            </option>
          ))}
        </select>
      </div>

      {/* Issues List */}
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue, idx) => (
            <div
              key={issue._id}
              className="relative w-full bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-200/40 via-pink-200/40 to-yellow-200/40 opacity-0 hover:opacity-100 transition duration-700 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                {/* Report Image */}
                {issue.imageUrl && (
                  <div className="w-full md:w-40 flex-shrink-0">
                    <img
                      src={issue.imageUrl}
                      alt="Report"
                      className="w-full h-32 object-cover rounded-lg shadow-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Text Info */}
                <div className="flex-1 space-y-2 w-full">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-indigo-700 line-clamp-1">
                    {translatedTitles[idx] || issue.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    <span className="font-semibold">{t("id")}:</span> {issue.reportId}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    <span className="font-semibold">{t("department")}:</span> {t(issue.department)}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    <span className="font-semibold">{t("submittedOn")}:</span>{" "}
                    {new Date(issue.submissionDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 truncate">
                    <span className="font-semibold">{t("description")}:</span>{" "}
                    {translatedDescriptions[idx] || issue.description}
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex md:flex-col md:justify-evenly flex-row items-end gap-3">
                  {/* Status Badge */}
                  <span
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold shadow-md transition ${
                      issue.status === "inprogress"
                        ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 shadow-yellow-200"
                        : issue.status === "approved"
                        ? "bg-gradient-to-r from-blue-300 to-blue-500 text-blue-900 shadow-blue-200"
                        : "bg-gradient-to-r from-red-300 to-red-500 text-red-900 shadow-red-200"
                    }`}
                  >
                    {t(issue.status)}
                  </span>

                  {/* 🆕 Upvote Button */}
                  <div className="flex  items-center gap-2 w-full rounded-full">
                    <button
                      onClick={() => handleUpvote(issue._id)}
                      className="px-3 py-1 bg-blue-500 h-7 md:h-10 text-white rounded-full hover:bg-blue-600 text-sm"
                    >
                      👍 {t("upvote")} 
                      <span className="ml-1 text-white text-sm font-semibold">
                      {upvotes[issue._id] || 0}
                    </span>
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center text-sm sm:text-lg">{t("noReports")}</p>
        )}
      </div>
    </div>
  );
}
