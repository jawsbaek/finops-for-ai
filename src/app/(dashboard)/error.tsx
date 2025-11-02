"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

/**
 * Dashboard Error Boundary
 * Catches errors within the dashboard section
 */
export default function DashboardErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to error reporting service
		console.error("Dashboard error:", error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Card className="w-full max-w-lg p-6">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="h-8 w-8 text-destructive" />
					</div>

					<div className="space-y-2">
						<h2 className="font-semibold text-foreground text-xl">
							데이터를 불러올 수 없습니다
						</h2>
						<p className="text-muted-foreground text-sm">
							일시적인 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시
							시도해주세요.
						</p>
					</div>

					{process.env.NODE_ENV === "development" && (
						<Card className="w-full bg-muted p-3">
							<p className="text-left font-mono text-muted-foreground text-xs">
								{error.message}
							</p>
						</Card>
					)}

					<Button onClick={reset} className="w-full">
						<RefreshCw className="mr-2 h-4 w-4" />
						다시 시도
					</Button>
				</div>
			</Card>
		</div>
	);
}
