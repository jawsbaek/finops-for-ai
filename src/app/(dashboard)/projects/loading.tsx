import { Card } from "@/components/ui/card";

/**
 * Loading UI for Projects page
 * Shows skeleton loaders while server data is being fetched
 */
export default function ProjectsLoading() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
					<div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
				</div>
				<div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
			</div>

			{/* Projects Grid Skeleton */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i} className="border-2 p-5">
						<div className="space-y-4">
							{/* Header */}
							<div className="flex items-start justify-between">
								<div className="flex-1 space-y-1">
									<div className="h-5 w-32 animate-pulse rounded bg-muted" />
									<div className="h-4 w-24 animate-pulse rounded bg-muted" />
								</div>
								<div className="ml-2 h-6 w-12 animate-pulse rounded bg-muted" />
							</div>

							{/* Cost */}
							<div className="space-y-1">
								<div className="h-4 w-20 animate-pulse rounded bg-muted" />
								<div className="h-8 w-28 animate-pulse rounded bg-muted" />
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
