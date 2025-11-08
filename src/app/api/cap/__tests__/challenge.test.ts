/**
 * Cap.js Challenge API Endpoint Tests
 *
 * Tests error handling, logging, and security measures for the challenge endpoint
 */

import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as loggerModule from "~/lib/logger";
import * as captchaModule from "~/server/api/captcha";
import { POST } from "../challenge/route";

// Using vi.mock() for captcha module (CLAUDE.md exception: depends on env/db)
const mockCreateChallenge = vi.hoisted(() => vi.fn());

vi.mock("~/server/api/captcha", () => ({
	createCaptchaChallenge: mockCreateChallenge,
}));

// Using vi.mock() for ratelimit module
vi.mock("~/server/api/ratelimit", () => ({
	rateLimits: {
		normal: {
			limit: vi.fn().mockResolvedValue({
				success: true,
				limit: 100,
				remaining: 99,
				reset: Date.now() + 60000,
			}),
		},
	},
}));

describe("Challenge API Endpoint", () => {
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let infoSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		errorSpy = vi
			.spyOn(loggerModule.logger, "error")
			.mockImplementation(() => {});
		infoSpy = vi
			.spyOn(loggerModule.logger, "info")
			.mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Error Handling", () => {
		it("should log error with stack trace when challenge creation fails", async () => {
			const testError = new Error("Database connection failed");
			mockCreateChallenge.mockRejectedValueOnce(testError);

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			await POST(mockRequest);

			expect(errorSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					error: "Database connection failed",
					stack: expect.stringContaining("Error: Database connection failed"),
				}),
				"Failed to create CAPTCHA challenge",
			);
		});

		it("should log error without stack trace for non-Error objects", async () => {
			mockCreateChallenge.mockRejectedValueOnce("String error");

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			await POST(mockRequest);

			expect(errorSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					error: "String error",
					stack: undefined,
				}),
				"Failed to create CAPTCHA challenge",
			);
		});

		it("should return 500 status code on error", async () => {
			mockCreateChallenge.mockRejectedValueOnce(new Error("Test error"));

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			const response = await POST(mockRequest);

			expect(response.status).toBe(500);
		});

		it("should include error message in development mode", async () => {
			// Mock NODE_ENV using vi.stubEnv
			vi.stubEnv("NODE_ENV", "development");

			mockCreateChallenge.mockRejectedValueOnce(
				new Error("Detailed error message"),
			);

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			const response = await POST(mockRequest);
			const body = await response.json();

			expect(body).toEqual({
				error: "Failed to create challenge",
				message: "Detailed error message",
			});

			vi.unstubAllEnvs();
		});

		it("should NOT include error message in production mode", async () => {
			// Mock NODE_ENV using vi.stubEnv
			vi.stubEnv("NODE_ENV", "production");

			mockCreateChallenge.mockRejectedValueOnce(
				new Error("Internal database error"),
			);

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			const response = await POST(mockRequest);
			const body = await response.json();

			// Should only contain generic error, no message field
			expect(body).toEqual({
				error: "Failed to create challenge",
			});
			expect(body.message).toBeUndefined();

			vi.unstubAllEnvs();
		});
	});

	describe("Success Cases", () => {
		it("should return challenge on success", async () => {
			const mockChallenge = {
				challenge: { c: 50, s: 32, d: 4 },
				token: "test-token-123",
				expires: Date.now() + 600000,
			};

			mockCreateChallenge.mockResolvedValueOnce(mockChallenge);

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			const response = await POST(mockRequest);
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body).toEqual(mockChallenge);
		});

		it("should log successful challenge creation", async () => {
			const mockChallenge = {
				challenge: { c: 50, s: 32, d: 4 },
				token: "test-token-abc123",
				expires: Date.now() + 600000,
			};

			mockCreateChallenge.mockResolvedValueOnce(mockChallenge);

			const mockRequest = {
				headers: {
					get: vi.fn().mockReturnValue("192.168.1.1"),
				},
			} as unknown as NextRequest;

			await POST(mockRequest);

			expect(infoSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					tokenPrefix: "test-token",
				}),
				"CAPTCHA challenge created",
			);
		});
	});
});
