import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function History() {
  const [issues, setIssues] = useState([]);
  const [translatedTitles, setTranslatedTitles] = useState([]);
  const [translatedDescriptions, setTranslatedDescriptions] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  // Fetch completed issues from backend
  useEffect(() => {
    const fetchCompletedIssues = async () => {
      setLoading(true);
      try {
        const nagarId = localStorage.getItem("nagarId");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/reports/com/completed?nagarId=${nagarId}`
        );
        const mapped = res.data.map((r) => ({
          id: r.reportId,
          title: r.title,
          status: r.status,
          department: r.department || t("na"),
          submittedDate: r.submissionDate
            ? new Date(r.submissionDate).toLocaleDateString()
            : "--",
          completedDate: r.completionDate
            ? new Date(r.completionDate).toLocaleDateString()
            : "--",
          description: r.description,
          imageUrl: r.imageUrl || null,
        }));
        setIssues(mapped);
        setTranslatedTitles(mapped.map((i) => i.title)); // default English
        setTranslatedDescriptions(mapped.map((i) => i.description)); // default English
      } catch (err) {
        console.error("Error fetching completed reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedIssues();
  }, [t]);

  // Translate titles & descriptions on language change
  useEffect(() => {
    if (issues.length === 0) return;

    const translateTexts = async () => {
      const langCode = `${i18n.language}-IN`;

      try {
        // Translate titles
        const resTitles = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/translate`,
          { texts: issues.map((i) => i.title), targetLanguage: langCode }
        );
        setTranslatedTitles(resTitles.data.translatedTexts);

        // Translate descriptions
        const resDescriptions = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/translate`,
          { texts: issues.map((i) => i.description), targetLanguage: langCode }
        );
        setTranslatedDescriptions(resDescriptions.data.translatedTexts);
      } catch (err) {
        console.error("Translation failed:", err);
        setTranslatedTitles(issues.map((i) => i.title));
        setTranslatedDescriptions(issues.map((i) => i.description));
      }
    };

    translateTexts();
  }, [i18n.language, issues]);

  // Unique departments
  const departments = [...new Set(issues.map((issue) => issue.department))];

  // Filter issues
  const filteredIssues = issues.filter(
    (issue, idx) =>
      issue.status === "completed" &&
      issue.id.toLowerCase().includes(searchId.toLowerCase()) &&
      (selectedDepartment === "" || issue.department === selectedDepartment)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500 text-center">
        {t("solvedIssuesHistory")}
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-6 w-full max-w-2xl mx-auto">
        <input
          type="text"
          placeholder={t("searchById")}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm md:text-base"
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm md:text-base"
        >
          <option value="">{t("allDepartments")}</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>
              {t(dept)}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-600 text-center text-lg">{t("loading")}</p>
      )}

      {/* Issue Cards */}
      {!loading && filteredIssues.length === 0 ? (
        <p className="text-gray-500 text-lg text-center">
          {t("noCompletedIssues")}
        </p>
      ) : (
        <div className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto px-1">
          {filteredIssues.map((issue, idx) => (
            <div
              key={idx}
              className="w-full bg-white rounded-3xl shadow-lg p-5 md:p-6 border border-gray-200 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Image (if exists) */}
                {issue.imageUrl && (
                  <div className="flex-shrink-0 w-full md:w-1/3">
                    <a
                      href={issue.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-48 md:h-40 object-cover rounded-xl shadow-md hover:opacity-90 transition"
                      />
                    </a>
                  </div>
                )}

                {/* Text details */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg md:text-2xl font-bold text-indigo-700">
                    {translatedTitles[idx] || issue.title}
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">{t("id")}:</span> {issue.id}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">{t("department")}:</span>{" "}
                    {t(issue.department)}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">{t("submittedOn")}:</span>{" "}
                    {issue.submittedDate}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">{t("completed")}:</span>{" "}
                    {issue.completedDate}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base">
                    <span className="font-semibold">{t("description")}:</span>{" "}
                    {translatedDescriptions[idx] || issue.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 self-start md:self-center">
                  <span className="px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                    {t(issue.status)}
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
