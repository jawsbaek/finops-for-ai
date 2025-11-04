import { TRPCError } from "@trpc/server";
import type { ValidationResult } from "./validation";

/**
 * Fetch OpenAI organization ID from API
 *
 * @param adminApiKey - Decrypted OpenAI Admin API key
 * @returns Organization ID (e.g., "org_abc123")
 * @throws TRPCError if API call fails or no organizations found
 */
export async function fetchOpenAIOrganizationId(
	adminApiKey: string,
): Promise<string> {
	try {
		const response = await fetch("https://api.openai.com/v1/organizations", {
			headers: {
				Authorization: `Bearer ${adminApiKey}`,
				"Content-Type": "application/json",
			},
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Failed to fetch organization from OpenAI API",
			});
		}

		const data = (await response.json()) as { data: Array<{ id: string }> };

		// Return first organization (user might belong to multiple)
		if (data.data && data.data.length > 0 && data.data[0]?.id) {
			return data.data[0].id;
		}

		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "No organizations found for this API key",
		});
	} catch (error) {
		if (error instanceof TRPCError) {
			throw error;
		}
		if (
			error instanceof Error &&
			(error.name === "TimeoutError" || error.name === "AbortError")
		) {
			throw new TRPCError({
				code: "TIMEOUT",
				message: "Organization fetch timeout. Please try again.",
			});
		}
		throw error;
	}
}

/**
 * Validate OpenAI project ID via API (Option A: project-scoped)
 *
 * @param adminApiKey - Decrypted OpenAI Admin API key
 * @param projectId - OpenAI project ID (e.g., "proj_xyz")
 * @returns Validation result with error message if invalid
 */
export async function validateOpenAIProjectId(
	adminApiKey: string,
	projectId: string,
): Promise<ValidationResult> {
	try {
		const response = await fetch(
			`https://api.openai.com/v1/organization/projects/${projectId}/api_keys?limit=1`,
			{
				headers: {
					Authorization: `Bearer ${adminApiKey}`,
					"Content-Type": "application/json",
				},
				signal: AbortSignal.timeout(5000),
			},
		);

		if (response.ok) {
			return { valid: true };
		}

		if (response.status === 404) {
			return {
				valid: false,
				error: "Project ID not found in your organization",
			};
		}

		if (response.status === 403) {
			return {
				valid: false,
				error: "Admin API Key does not have access to this project",
			};
		}

		// Other errors (429, 500, etc.)
		const errorText = await response.text();
		throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
	} catch (error) {
		if (
			error instanceof Error &&
			(error.name === "TimeoutError" || error.name === "AbortError")
		) {
			throw new TRPCError({
				code: "TIMEOUT",
				message: "Validation timeout. Please try again.",
			});
		}
		throw error;
	}
}
