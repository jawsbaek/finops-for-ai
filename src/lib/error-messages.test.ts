import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES } from "./error-messages";

describe("ERROR_MESSAGES", () => {
	it("should have Korean team error messages", () => {
		expect(ERROR_MESSAGES.TEAM_NOT_FOUND).toBe("팀을 찾을 수 없습니다.");
		expect(ERROR_MESSAGES.TEAM_ACCESS_DENIED).toBe(
			"이 팀에 접근 권한이 없습니다.",
		);
		expect(ERROR_MESSAGES.TEAM_ADMIN_REQUIRED).toBe(
			"팀 관리자 권한이 필요합니다.",
		);
		expect(ERROR_MESSAGES.TEAM_MEMBER_NOT_FOUND).toBe(
			"팀 멤버를 찾을 수 없습니다.",
		);
		expect(ERROR_MESSAGES.TEAM_MEMBER_ALREADY_EXISTS).toBe(
			"이미 팀에 추가된 멤버입니다.",
		);
	});

	it("should have Korean project error messages", () => {
		expect(ERROR_MESSAGES.PROJECT_NOT_FOUND).toBe(
			"프로젝트를 찾을 수 없습니다.",
		);
		expect(ERROR_MESSAGES.PROJECT_ACCESS_DENIED).toBe(
			"이 프로젝트에 접근 권한이 없습니다.",
		);
		expect(ERROR_MESSAGES.PROJECT_MEMBER_NOT_FOUND).toBe(
			"프로젝트 멤버를 찾을 수 없습니다.",
		);
		expect(ERROR_MESSAGES.PROJECT_MEMBER_ALREADY_EXISTS).toBe(
			"이미 프로젝트에 추가된 멤버입니다.",
		);
		expect(ERROR_MESSAGES.PROJECT_MEMBER_CANNOT_REMOVE_SELF).toBe(
			"본인을 프로젝트에서 제거할 수 없습니다.",
		);
	});

	it("should have Korean API key error messages", () => {
		expect(ERROR_MESSAGES.API_KEY_NOT_FOUND).toBe("API 키를 찾을 수 없습니다.");
		expect(ERROR_MESSAGES.API_KEY_ALREADY_DISABLED).toBe(
			"이미 비활성화된 API 키입니다.",
		);
		expect(ERROR_MESSAGES.API_KEY_ALREADY_ACTIVE).toBe(
			"이미 활성화된 API 키입니다.",
		);
		expect(ERROR_MESSAGES.API_KEY_INVALID_FORMAT).toBe(
			"올바르지 않은 API 키 형식입니다.",
		);
		expect(ERROR_MESSAGES.API_KEY_DELETION_REASON_REQUIRED).toBe(
			"삭제 사유는 필수입니다.",
		);
		expect(ERROR_MESSAGES.API_KEY_DISABLE_REASON_REQUIRED).toBe(
			"비활성화 사유는 필수입니다.",
		);
	});

	it("should have Korean validation error messages", () => {
		expect(ERROR_MESSAGES.VALIDATION_REASON_TOO_LONG).toBe(
			"사유는 500자 이내로 입력해주세요.",
		);
		expect(ERROR_MESSAGES.VALIDATION_NAME_TOO_LONG).toBe(
			"이름은 100자 이내로 입력해주세요.",
		);
		expect(ERROR_MESSAGES.VALIDATION_EMAIL_INVALID).toBe(
			"올바른 이메일 주소를 입력해주세요.",
		);
		expect(ERROR_MESSAGES.VALIDATION_REQUIRED_FIELD).toBe(
			"필수 입력 항목입니다.",
		);
	});

	it("should have Korean generic error messages", () => {
		expect(ERROR_MESSAGES.INTERNAL_SERVER_ERROR).toBe(
			"서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
		);
		expect(ERROR_MESSAGES.UNAUTHORIZED).toBe("인증이 필요합니다.");
		expect(ERROR_MESSAGES.FORBIDDEN).toBe("권한이 없습니다.");
	});

	it("should be a const object with all required fields", () => {
		// Verify all expected fields exist
		expect(ERROR_MESSAGES).toHaveProperty("TEAM_NOT_FOUND");
		expect(ERROR_MESSAGES).toHaveProperty("PROJECT_NOT_FOUND");
		expect(ERROR_MESSAGES).toHaveProperty("API_KEY_NOT_FOUND");
		expect(ERROR_MESSAGES).toHaveProperty("VALIDATION_REASON_TOO_LONG");
		expect(ERROR_MESSAGES).toHaveProperty("INTERNAL_SERVER_ERROR");
		expect(ERROR_MESSAGES).toHaveProperty("UNAUTHORIZED");
		expect(ERROR_MESSAGES).toHaveProperty("FORBIDDEN");
	});
});
