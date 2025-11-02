import { StatCard } from "@/components/custom";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { formatChange, formatCurrency, getTrend } from "~/lib/utils/format";
import { HydrateClient, api } from "~/trpc/server";

export const metadata: Metadata = {
	title: "대시보드",
	description: "AI 인프라 비용 추적 및 분석 대시보드",
};

export default async function DashboardPage() {
	// Fetch cost summary data on the server
	const costSummary = await api.cost.getSummary({});

	return (
		<HydrateClient>
			<div className="space-y-6">
				<div>
					<h2 className="font-bold text-2xl text-foreground">
						Welcome to FinOps for AI
					</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Track and optimize your AI infrastructure costs
					</p>
				</div>

				{/* Cost Summary Cards */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard
						label="어제 총 비용"
						value={formatCurrency(costSummary?.yesterdayCost ?? 0)}
						icon={<DollarSign className="h-5 w-5" />}
						variant="primary"
					/>

					<StatCard
						label="이번 주 총 비용"
						value={formatCurrency(costSummary?.thisWeekCost ?? 0)}
						change={
							costSummary?.weeklyChange !== undefined &&
							costSummary?.weeklyChange !== 0
								? formatChange(costSummary.weeklyChange)
								: undefined
						}
						trend={
							costSummary?.weeklyChange !== undefined
								? getTrend(costSummary.weeklyChange)
								: "neutral"
						}
						icon={<TrendingUp className="h-5 w-5" />}
						variant="primary"
					/>

					<StatCard
						label="데이터 업데이트 지연"
						value="8-24시간"
						icon={<Clock className="h-5 w-5" />}
						variant="warning"
					/>
				</div>

				{/* Data Status Info */}
				{costSummary && (
					<div
						className="rounded-lg border border-info/30 bg-info/10 p-4"
						aria-label="데이터 상태 정보"
					>
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-info"
									viewBox="0 0 20 20"
									fill="currentColor"
									role="img"
									aria-label="정보 아이콘"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3 flex-1">
								<p className="text-info-foreground text-sm">
									<strong>Note:</strong> OpenAI API usage data is delayed by
									8-24 hours. The cost shown here reflects usage from 1-2 days
									ago, not real-time usage.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Empty State (when no data) */}
				{costSummary?.yesterdayCost === 0 &&
					costSummary?.thisWeekCost === 0 && (
						<div
							className="rounded-lg border-2 border-border border-dashed p-12"
							aria-label="데이터 없음"
						>
							<div className="text-center">
								<svg
									className="mx-auto h-12 w-12 text-muted-foreground"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									role="img"
									aria-label="데이터 없음 아이콘"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
								<h3 className="mt-2 font-semibold text-foreground text-sm">
									No cost data yet
								</h3>
								<p className="mt-1 text-muted-foreground text-sm">
									비용 데이터가 아직 없습니다. API 키를 설정하고 비용 수집을
									기다리세요.
								</p>
								<p className="mt-2 text-muted-foreground/70 text-xs">
									Data collection runs daily at 9am KST
								</p>
							</div>
						</div>
					)}
			</div>
		</HydrateClient>
	);
}
