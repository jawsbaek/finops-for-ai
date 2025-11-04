/**
 * i18n (Internationalization) Module
 *
 * This module provides internationalization support for the application.
 *
 * Current Status:
 * - Korean (ko) is the default and primary language
 * - English (en) translations are prepared but not yet fully implemented
 *
 * Usage:
 * ```tsx
 * import { useTranslations } from '~/lib/i18n';
 *
 * function MyComponent() {
 *   const t = useTranslations();
 *   return <button>{t.common.save}</button>; // "저장"
 * }
 * ```
 *
 * Future Enhancement:
 * When English support is needed:
 * 1. Add locale detection/selection mechanism
 * 2. Store user locale preference in database
 * 3. Implement locale switching UI
 * 4. Add locale parameter to server-side functions
 */

import type { Locale } from "./types";
import { DEFAULT_LOCALE } from "./types";

import { messages as enMessages } from "./messages.en";
// Import translations
import { messages as koMessages } from "./messages.ko";

const translations = {
	ko: koMessages,
	en: enMessages,
} as const;

/**
 * Get translations for a specific locale
 *
 * @param locale - The locale to get translations for
 * @returns Translation object for the locale
 */
export function getTranslations(locale: Locale = DEFAULT_LOCALE) {
	return translations[locale];
}

/**
 * React hook for using translations in components
 *
 * Currently always returns Korean translations.
 * In the future, this will read from user preferences or browser settings.
 *
 * @returns Translation object
 */
export function useTranslations() {
	// TODO: Get user's preferred locale from:
	// 1. User settings in database
	// 2. Browser language settings
	// 3. Cookie/localStorage
	const locale = DEFAULT_LOCALE;
	return getTranslations(locale);
}

/**
 * Get translations for server-side usage
 *
 * @param locale - Optional locale override
 * @returns Translation object
 */
export function getServerTranslations(locale: Locale = DEFAULT_LOCALE) {
	return getTranslations(locale);
}

// Re-export types and constants
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./types";
export type { Locale, LocaleConfig } from "./types";
export type { Messages } from "./messages.ko";
