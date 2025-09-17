import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function TrackIssue() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // List of stages
  const stages = [
    t("submitted"),
    t("approved"),
    t("inProgress"),
    t("completed")
  ];

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      const nagarId = localStorage.getItem("nagarId");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reports/rep/${searchId}?nagarId=${nagarId}`
      );

      setResult(res.data || { notFound: true });
    } catch (err) {
      console.error(err);
      setResult({ notFound: true });
    } finally {
      setLoading(false);
    }
  };

  // Get date for a stage
  const getDate = (stage) => {
    if (!result) return "--";
    switch (stage) {
      case t("submitted"):
        return result.submissionDate
          ? new Date(result.submissionDate).toLocaleDateString()
          : "--";
      case t("approved"):
        return result.approvalDate
          ? new Date(result.approvalDate).toLocaleDateString()
          : "--";
      case t("inProgress"):
        return result.inprogressDate
          ? new Date(result.inprogressDate).toLocaleDateString()
          : "--";
      case t("completed"):
        return result.completionDate
          ? new Date(result.completionDate).toLocaleDateString()
          : "--";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-500 text-center">
        {t("trackYourIssue")}
      </h2>

      {/* Search Box */}
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-8 w-full max-w-xl">
        <input
          type="text"
          placeholder={t("enterIssueId")}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm md:text-base"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-lg font-semibold shadow-md hover:from-pink-500 hover:to-yellow-500 transition text-sm md:text-base"
        >
          {loading ? t("loading") : t("track")}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-200 hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 relative">
          {result.notFound ? (
            <p className="text-red-500 text-lg font-semibold text-center">
              {t("noIssueFound")} "{searchId}"
            </p>
          ) : (
            <>
              {/* Issue Details */}
              <div className="mb-10">
                <h3 className="text-xl md:text-2xl font-bold text-indigo-700">
                  {result.title}
                </h3>
                <p className="text-gray-700 mt-2 text-sm md:text-base">
                  <span className="font-semibold">{t("id")}:</span> {result.reportId}
                </p>
                <p className="text-gray-700 mt-1 text-sm md:text-base">
                  <span className="font-semibold">{t("department")}:</span>{" "}
                  {t(result.department) || t("na")}
                </p>
                <p className="text-gray-700 mt-1 text-sm md:text-base">
                  <span className="font-semibold">{t("submittedBy")}:</span>{" "}
                  {result.reporterEmail}
                </p>
                <p className="text-gray-700 mt-2 text-sm md:text-base">
                  <span className="font-semibold">{t("description")}:</span>{" "}
                  {result.description}
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="relative flex justify-between items-center">
                {/* Horizontal Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 z-0 rounded-full"></div>
                <div
                  className="absolute top-5 left-0 h-1 bg-indigo-500 z-0 rounded-full"
                  style={{
                    width: `${
                      ((stages.filter(isActive).length - 1) / (stages.length - 1)) *
                      100
                    }%`,
                    transition: "width 0.5s",
                  }}
                ></div>

                {stages.map((stage, index) => (
                  <div
                    key={stage}
                    className="relative flex flex-col items-center z-10"
                  >
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        isActive(stage)
                          ? "bg-gradient-to-r from-indigo-500 to-pink-500 shadow-lg"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="mt-2 text-xs md:text-sm font-medium text-center">
                      {stage}
                    </span>
                    <span className="mt-1 text-[10px] md:text-xs text-gray-600">
                      {getDate(stage)}
                    </span>
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
