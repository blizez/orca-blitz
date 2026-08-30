import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enSidebar from "./locales/en/sidebar.json";
import enSettings from "./locales/en/settings.json";
import enProviders from "./locales/en/providers.json";
import enBusiness from "./locales/en/business.json";
import enModals from "./locales/en/modals.json";
import enInbox from "./locales/en/inbox.json";

import esCommon from "./locales/es/common.json";
import esSidebar from "./locales/es/sidebar.json";
import esSettings from "./locales/es/settings.json";
import esProviders from "./locales/es/providers.json";
import esBusiness from "./locales/es/business.json";
import esModals from "./locales/es/modals.json";
import esInbox from "./locales/es/inbox.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        sidebar: enSidebar,
        settings: enSettings,
        providers: enProviders,
        business: enBusiness,
        modals: enModals,
        inbox: enInbox,
      },
      es: {
        common: esCommon,
        sidebar: esSidebar,
        settings: esSettings,
        providers: esProviders,
        business: esBusiness,
        modals: esModals,
        inbox: esInbox,
      },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    ns: ["common"],
    defaultNS: "common",
  });

export default i18n;
