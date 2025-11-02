import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: {
		default: "FinOps for AI",
		template: "%s | FinOps for AI",
	},
	description:
		"AI 인프라 비용을 추적하고 최적화하는 FinOps 플랫폼. OpenAI API 사용량 모니터링 및 비용 관리",
	keywords: [
		"FinOps",
		"AI",
		"비용 관리",
		"OpenAI",
		"API 모니터링",
		"비용 최적화",
		"클라우드 비용",
	],
	authors: [{ name: "FinOps for AI Team" }],
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	openGraph: {
		title: "FinOps for AI",
		description: "AI 인프라 비용 추적 및 최적화 플랫폼",
		type: "website",
		locale: "ko_KR",
	},
	robots: {
		index: true,
		follow: true,
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
