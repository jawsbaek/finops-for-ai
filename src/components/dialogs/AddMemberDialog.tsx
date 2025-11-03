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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface TeamMember {
	id: string;
	userId: string;
	role: string;
	user: {
		id: string;
		name: string | null;
		email: string;
	};
}

interface AddMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (userId: string) => void;
	isLoading?: boolean;
	teamMembers: TeamMember[];
	existingMemberUserIds: string[];
}

/**
 * Dialog for adding a team member to a project
 *
 * Features:
 * - Dropdown selection of team members
 * - Disables already-added members
 * - Shows member preview before adding
 */
export function AddMemberDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading = false,
	teamMembers,
	existingMemberUserIds,
}: AddMemberDialogProps) {
	const [selectedUserId, setSelectedUserId] = useState<string>("");

	const handleConfirm = () => {
		if (selectedUserId) {
			onConfirm(selectedUserId);
			// Form will be reset when dialog closes via handleOpenChange
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	// Reset form when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setSelectedUserId("");
		}
		onOpenChange(newOpen);
	};

	// Get selected member details for preview
	const selectedMember = teamMembers.find((m) => m.userId === selectedUserId);

	const isConfirmEnabled = selectedUserId.length > 0;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<UserPlus className="h-5 w-5 text-primary" />
						</div>
						<div className="flex-1">
							<DialogTitle>프로젝트 멤버 추가</DialogTitle>
							<DialogDescription>
								팀 멤버 중에서 프로젝트에 추가할 사용자를 선택하세요
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="member-select">
							팀 멤버 선택 <span className="text-destructive">*</span>
						</Label>
						<Select
							value={selectedUserId}
							onValueChange={setSelectedUserId}
							disabled={isLoading}
						>
							<SelectTrigger id="member-select">
								<SelectValue placeholder="멤버를 선택하세요" />
							</SelectTrigger>
							<SelectContent>
								{teamMembers.map((member) => {
									const isAlreadyMember = existingMemberUserIds.includes(
										member.userId,
									);
									return (
										<SelectItem
											key={member.userId}
											value={member.userId}
											disabled={isAlreadyMember}
										>
											<div className="flex items-center gap-2">
												<div className="flex-1">
													<p className="font-medium text-sm">
														{member.user.name || member.user.email}
													</p>
													{member.user.name && (
														<p className="text-muted-foreground text-xs">
															{member.user.email}
														</p>
													)}
												</div>
												{isAlreadyMember && (
													<span className="text-muted-foreground text-xs">
														(이미 추가됨)
													</span>
												)}
											</div>
										</SelectItem>
									);
								})}
								{teamMembers.length === 0 && (
									<SelectItem value="_empty" disabled>
										팀 멤버가 없습니다
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					{selectedMember && (
						<div className="rounded-lg border border-border bg-muted p-3">
							<p className="mb-1 font-medium text-sm">선택한 멤버:</p>
							<p className="text-foreground text-sm">
								{selectedMember.user.name || selectedMember.user.email}
							</p>
							<p className="text-muted-foreground text-xs">
								{selectedMember.user.email}
							</p>
							<p className="mt-2 text-muted-foreground text-xs">
								역할: {selectedMember.role}
							</p>
						</div>
					)}

					<div className="rounded-lg border border-border bg-muted p-3">
						<p className="text-sm leading-relaxed">
							<span className="font-semibold">참고:</span> 추가된 멤버는 이
							프로젝트의 비용 데이터를 확인하고 API 키를 관리할 수 있습니다.
						</p>
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
						onClick={handleConfirm}
						disabled={!isConfirmEnabled || isLoading}
					>
						{isLoading ? "추가 중..." : "멤버 추가"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
