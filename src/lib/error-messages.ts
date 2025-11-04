/**
 * Centralized Korean error messages for consistent UX
 * All backend error messages should use these constants
 */

export const ERROR_MESSAGES = {
	// Team errors
	TEAM_NOT_FOUND: "팀을 찾을 수 없습니다.",
	TEAM_ACCESS_DENIED: "이 팀에 접근 권한이 없습니다.",
	TEAM_ADMIN_REQUIRED: "팀 관리자 권한이 필요합니다.",
	TEAM_OWNER_REQUIRED: "팀 소유자 권한이 필요합니다.",
	TEAM_MEMBER_NOT_FOUND: "팀 멤버를 찾을 수 없습니다.",
	TEAM_MEMBER_ALREADY_EXISTS: "이미 팀에 추가된 멤버입니다.",
	TEAM_OWNER_CANNOT_LEAVE: "팀 소유자는 팀에서 나갈 수 없습니다.",
	TEAM_CANNOT_CHANGE_OWN_ROLE: "자신의 역할은 변경할 수 없습니다.",
	TEAM_NEW_OWNER_NOT_EXIST: "새 소유자를 찾을 수 없습니다.",

	// Project errors
	PROJECT_NOT_FOUND: "프로젝트를 찾을 수 없습니다.",
	PROJECT_ACCESS_DENIED: "이 프로젝트에 접근 권한이 없습니다.",
	PROJECT_MEMBER_NOT_FOUND: "프로젝트 멤버를 찾을 수 없습니다.",
	PROJECT_MEMBER_ALREADY_EXISTS: "이미 프로젝트에 추가된 멤버입니다.",
	PROJECT_MEMBER_CANNOT_REMOVE_SELF: "본인을 프로젝트에서 제거할 수 없습니다.",
	PROJECT_TEAM_ADMIN_REQUIRED: "팀 관리자 권한이 필요합니다.",
	PROJECT_USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",

	// API Key errors
	API_KEY_NOT_FOUND: "API 키를 찾을 수 없습니다.",
	API_KEY_ALREADY_DISABLED: "이미 비활성화된 API 키입니다.",
	API_KEY_ALREADY_ACTIVE: "이미 활성화된 API 키입니다.",
	API_KEY_INVALID_FORMAT: "올바르지 않은 API 키 형식입니다.",
	API_KEY_DELETION_REASON_REQUIRED: "삭제 사유는 필수입니다.",
	API_KEY_DISABLE_REASON_REQUIRED: "비활성화 사유는 필수입니다.",
	ADMIN_KEY_NOT_FOUND: "관리자 API 키를 찾을 수 없습니다.",
	ADMIN_KEY_REGISTER_PERMISSION_DENIED:
		"관리자 API 키 등록은 팀 소유자 또는 관리자만 가능합니다.",

	// Validation errors
	VALIDATION_REASON_TOO_LONG: "사유는 500자 이내로 입력해주세요.",
	VALIDATION_NAME_TOO_LONG: "이름은 100자 이내로 입력해주세요.",
	VALIDATION_EMAIL_INVALID: "올바른 이메일 주소를 입력해주세요.",
	VALIDATION_REQUIRED_FIELD: "필수 입력 항목입니다.",

	// Auth errors
	AUTH_USER_ALREADY_EXISTS: "이미 존재하는 이메일 주소입니다.",
	AUTH_INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
	AUTH_USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",

	// Cost errors
	COST_TEAM_ACCESS_DENIED: "이 팀의 비용 데이터에 접근 권한이 없습니다.",

	// Generic errors
	INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
	UNAUTHORIZED: "인증이 필요합니다.",
	FORBIDDEN: "권한이 없습니다.",
	USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
} as const;
