/**
 * i18n Type Definitions
 *
 * This file defines the structure for internationalization support.
 * Currently supports Korean (ko), with English (en) planned for future.
 */

export type Locale = "ko" | "en";

export const DEFAULT_LOCALE: Locale = "ko";

export interface LocaleConfig {
	code: Locale;
	name: string;
	nativeName: string;
}

export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
	ko: {
		code: "ko",
		name: "Korean",
		nativeName: "한국어",
	},
	en: {
		code: "en",
		name: "English",
		nativeName: "English",
	},
} as const;
