"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ConfirmDeleteKeyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string) => void;
	isLoading?: boolean;
	apiKeyLast4?: string;
}

/**
 * Type-to-confirm dialog for deleting API keys
 *
 * Implements strong confirmation pattern:
 * - User must type exact string "삭제" to enable confirm button
 * - Requires reason input
 * - Shows destructive warning about permanent deletion
 */
export function ConfirmDeleteKeyDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
	apiKeyLast4,
}: ConfirmDeleteKeyDialogProps) {
	const [confirmText, setConfirmText] = useState("");
	const [reason, setReason] = useState("");

	const handleConfirm = () => {
		if (confirmText === "삭제" && reason.trim()) {
			onConfirm(reason);
			// Form will be reset when dialog closes via handleOpenChange
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
		// Form will be reset via handleOpenChange
	};

	const isConfirmEnabled = confirmText === "삭제" && reason.trim().length > 0;

	// Reset form when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setConfirmText("");
			setReason("");
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="h-5 w-5 text-destructive" />
						</div>
						<div className="flex-1">
							<DialogTitle>API 키 영구 삭제</DialogTitle>
							<DialogDescription>
								이 작업은 되돌릴 수 없습니다
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{apiKeyLast4 && (
						<div className="rounded-lg border border-border bg-muted p-3">
							<p className="font-medium text-sm">API 키: ...{apiKeyLast4}</p>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="reason">
							삭제 사유 <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="reason"
							placeholder="예: 더 이상 사용하지 않음, 보안 정책 변경 등"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							disabled={isLoading}
							className="min-h-[80px]"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirm">
							확인하려면 <span className="font-bold font-mono">삭제</span>를
							입력하세요 <span className="text-destructive">*</span>
						</Label>
						<Input
							id="confirm"
							placeholder="삭제"
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							disabled={isLoading}
							className="font-mono"
						/>
					</div>

					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
						<p className="mb-2 font-semibold text-sm">
							<AlertTriangle className="mr-1 inline h-4 w-4" />
							경고: 영구 삭제
						</p>
						<ul className="ml-4 list-disc space-y-1 text-sm leading-relaxed">
							<li>API 키가 데이터베이스에서 완전히 삭제됩니다</li>
							<li>이 키를 사용하는 모든 애플리케이션이 즉시 차단됩니다</li>
							<li>삭제 후 복구할 수 없습니다</li>
							<li>과거 비용 데이터는 보존됩니다</li>
						</ul>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isLoading}
					>
						취소
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={!isConfirmEnabled || isLoading}
					>
						{isLoading ? "삭제 중..." : "영구 삭제"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
