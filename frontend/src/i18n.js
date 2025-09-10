import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locals/en/translation.json";
import hi from "./locals/hi/translation.json";
import ta from "./locals/ta/translation.json";
import bn from "./locals/bn/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    bn: { translation: bn }
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
