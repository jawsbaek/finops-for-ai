import { Card } from "@/components/ui/card";

/**
 * Loading UI for Dashboard page
 * Shows skeleton loaders while server data is being fetched
 */
export default function DashboardLoading() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="space-y-2">
				<div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
			</div>

			{/* Cards Skeleton */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<Card key={i} className="p-6">
						<div className="space-y-3">
							<div className="h-4 w-24 animate-pulse rounded bg-muted" />
							<div className="h-8 w-32 animate-pulse rounded bg-muted" />
							<div className="h-4 w-16 animate-pulse rounded bg-muted" />
						</div>
					</Card>
				))}
			</div>

			{/* Info Banner Skeleton */}
			<div className="h-20 animate-pulse rounded-lg bg-muted" />
		</div>
	);
}
