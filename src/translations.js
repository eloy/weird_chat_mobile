import I18n from './i18n'
// import EN from './locales/en';
import ES from './locales/es';
// import {getLanguages} from './device_tools';

const DEFAULT_LOCALE = 'es';

export const initTranslations = async () => {
  I18n.defaultLocale = DEFAULT_LOCALE;
  I18n.fallbacks = true;
  // I18n.translations = {en: EN, es: ES}
  I18n.translations = {es: ES}

  // return getLanguages().then(locales => {
  //   let locale = getPreferredLocale(locales);
  //   I18n.locale = locale;
  // })
}


const getPreferredLocale = (deviceLocales) => {
  // for (let locale of deviceLocales) {
  //   for (let alias of I18n.locales.default(locale)) {
  //     if (alias === "es") return "es";
  //     // if (alias === "en") return "en";
  //   }
  // }
  return DEFAULT_LOCALE;
}
