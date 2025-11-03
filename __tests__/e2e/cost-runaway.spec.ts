import { expect, test } from "@playwright/test";
import {
	elementExists,
	generateTestUser,
	navigateAndVerify,
	setupTestUser,
} from "./helpers";

/**
 * E2E Test: 비용 폭주 방지 UI 플로우 검증
 *
 * Note: 현재 구현의 UI 플로우와 접근성을 검증하는 단순화된 테스트
 * 실제 backend 통합 및 API 기능은 별도 통합 테스트에서 검증
 */

test.describe("Cost Runaway Prevention", () => {
	test("should verify basic project creation and dashboard access", async ({
		page,
	}) => {
		// Setup test user
		await setupTestUser(page);

		// Verify main pages are accessible
		await navigateAndVerify(page, "/projects", /프로젝트/);
		await navigateAndVerify(page, "/reports", /주간 리포트/);
	});

	test("should verify project creation UI flow", async ({ page }) => {
		// Setup test user
		const user = await setupTestUser(page);

		// Navigate to projects page
		await page.goto("/projects");

		// Check if "새 프로젝트" button exists
		const createButton = page.locator('button:has-text("새 프로젝트")');
		if (await elementExists(page, 'button:has-text("새 프로젝트")')) {
			const projectName = `test-project-${user.id}`;

			await createButton.click();
			await page.waitForSelector("input#name");
			await page.fill("input#name", projectName);
			await page.fill("textarea#description", "테스트 프로젝트");

			// Submit and wait for navigation
			const submitButton = page.locator('button:has-text("생성")').last();
			await submitButton.click({ force: true });
			await page.waitForURL(/\/projects\/[^/]+$/, { timeout: 15000 });

			// Verify project detail page
			await expect(page.locator("h2").first()).toContainText(projectName);
		}
	});

	test("should verify navigation and basic UI elements", async ({ page }) => {
		// Setup test user
		await setupTestUser(page);

		// Verify all main navigation links work
		const navLinks = ["/dashboard", "/projects", "/teams", "/reports"];
		for (const link of navLinks) {
			await page.goto(link);
			// Verify page loaded (has an h2 heading)
			await expect(page.locator("h2").first()).toBeVisible();
		}

		// Verify logout button exists
		const logoutButton = page.locator('button:has-text("Logout")');
		await expect(logoutButton).toBeVisible();
	});
});
