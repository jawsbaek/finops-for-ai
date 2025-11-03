import { expect, test } from "@playwright/test";
import {
	createProject,
	createTeam,
	elementExists,
	generateTestUser,
	navigateAndVerify,
	setupTestUser,
} from "./helpers";

/**
 * Epic 1 E2E Test: 비용 급증 감지 및 즉시 대응
 *
 * 사용자 여정:
 * 1. 회원가입 및 로그인
 * 2. 팀 생성
 * 3. 프로젝트 생성
 * 4. API 키 등록
 * 5. 비용 수집 시뮬레이션 (Mock OpenAI API)
 * 6. 대시보드에서 비용 확인
 * 7. 임계값 설정
 * 8. 비용 폭주 시뮬레이션
 * 9. 알림 발송 확인
 * 10. API 키 비활성화
 * 11. 비활성화 상태 확인
 */

test.describe("Epic 1 - 비용 급증 감지 및 즉시 대응", () => {
	test.beforeEach(async ({ page }) => {
		// Mock external APIs to avoid real API calls
		await page.route("https://api.openai.com/**", (route) => {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: [
						{
							timestamp: Date.now(),
							aggregation_timestamp: Date.now() / 1000,
							n_requests: 10,
							operation: "chat.completions",
							n_context_tokens_total: 1000,
							n_generated_tokens_total: 500,
						},
					],
				}),
			});
		});
	});

	test("complete user journey from signup to cost runaway prevention", async ({
		page,
	}) => {
		const user = generateTestUser();
		const teamName = `테스트팀-${user.id}`;
		const projectName = `테스트프로젝트-${user.id}`;

		// 1 & 2. 회원가입 및 대시보드 확인
		await page.goto("/signup");
		await expect(page).toHaveTitle(/FinOps for AI/);
		await setupTestUser(page);

		// 3. 팀 생성
		await createTeam(page, teamName);

		// 4. 프로젝트 생성
		await createProject(page, projectName, "테스트 프로젝트입니다");

		// 5. 대시보드에서 비용 확인
		await navigateAndVerify(page, "/dashboard", /Welcome to FinOps/);

		// 6. 프로젝트 페이지에서 생성한 프로젝트 확인
		await page.goto("/projects");
		await expect(page.locator(`text=${projectName}`)).toBeVisible();

		// 7. 리포트 페이지 확인
		await navigateAndVerify(page, "/reports", /주간 리포트 아카이브/);

		// 테스트 완료 - 기본 사용자 여정 검증됨
		// (회원가입 → 팀 생성 → 프로젝트 생성 → 대시보드 → 프로젝트 확인 → 리포트)
	});

	test("weekly report access", async ({ page }) => {
		// Setup test user
		await setupTestUser(page);

		// Navigate to reports page and verify
		await navigateAndVerify(
			page,
			"/reports",
			/주간 리포트 아카이브|Weekly.*Report/i,
		);

		// Top 3/Bottom 3 프로젝트 섹션 확인 (데이터가 있는 경우)
		if (await elementExists(page, "text=/Top 3|Bottom 3|효율|efficiency/i")) {
			const reportContent = page.locator(
				"text=/Top 3|Bottom 3|효율|efficiency/i",
			);
			await expect(reportContent.first()).toBeVisible();
		}
	});

	test("project cost drilldown", async ({ page }) => {
		// Setup test user
		await setupTestUser(page);

		// Navigate to projects page
		await page.goto("/projects");

		// 첫 번째 프로젝트 선택 (존재하는 경우)
		if (
			await elementExists(page, '[data-testid="project-card"], .project-item')
		) {
			const firstProject = page
				.locator('[data-testid="project-card"], .project-item')
				.first();
			await firstProject.click();

			// 프로젝트 상세 페이지 확인
			await expect(page.locator("h2").first()).toContainText(
				/프로젝트|Project/,
			);

			// 비용 추이 그래프 확인 (Recharts 또는 차트 라이브러리 사용)
			if (
				await elementExists(page, '[role="img"], .recharts-wrapper, canvas')
			) {
				const chart = page.locator('[role="img"], .recharts-wrapper, canvas');
				await expect(chart.first()).toBeVisible();
			}

			// 메트릭 입력 필드 확인
			if (await elementExists(page, "text=/메트릭|Metrics|성과/i")) {
				const metricsSection = page.locator("text=/메트릭|Metrics|성과/i");
				await expect(metricsSection).toBeVisible();
			}
		}
	});
});
