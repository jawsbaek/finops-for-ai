import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

/**
 * 404 Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md p-6">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<FileQuestion className="h-8 w-8 text-muted-foreground" />
					</div>

					<div className="space-y-2">
						<h1 className="font-semibold text-2xl text-foreground">
							페이지를 찾을 수 없습니다
						</h1>
						<p className="text-muted-foreground text-sm">
							요청하신 페이지가 존재하지 않거나 이동되었습니다.
						</p>
					</div>

					<div className="flex w-full gap-2">
						<Button asChild variant="outline" className="flex-1">
							<Link href="/dashboard">대시보드</Link>
						</Button>
						<Button asChild className="flex-1">
							<Link href="/">홈으로</Link>
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
