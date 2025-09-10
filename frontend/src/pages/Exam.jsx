import React from "react";
import { useTranslation } from "react-i18next";
import "../i18n";

function Exam() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      {/* Language Switcher (Dropdown) */}
      <div className="mb-4">
        <select
          onChange={changeLanguage}
          defaultValue="en"
          className="border p-2 rounded"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>

      {/* Website Text (from JSON) */}
      <h1 className="text-2xl font-bold">{t("welcome")}</h1>
      <p className="mt-2">{t("history")}</p>
      <p className="mt-2">{t("notices")}</p>
    </div>
  );
}

export default Exam;
