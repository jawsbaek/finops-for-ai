# Story 1.18: Skeleton States로 사용자 경험 개선

**Status:** 📋 TODO

**Priority:** 🟢 LOW

---

## User Story

**As a** 사용자,
**I want** 데이터 로딩 중에 스켈레톤 로더를 보고,
**So that** 페이지 구조를 미리 파악하고 더 나은 로딩 경험을 할 수 있다.

---

## Context

**배경:**
현재 대부분의 페이지에서 데이터 로딩 시 스피너(Loader2)를 사용하고 있습니다. 스피너는 구현이 간단하고 현재 구현도 완벽히 작동하지만, 스켈레톤 로더를 사용하면 다음과 같은 추가 이점을 얻을 수 있습니다:

**스켈레톤 로더의 장점:**
1. **Perceived Performance (체감 성능)**: 사용자가 실제보다 빠르게 느낌
2. **레이아웃 파악**: 로딩 중에도 페이지 구조를 미리 볼 수 있음
3. **Layout Shift 방지**: 콘텐츠가 로드될 때 화면이 덜 밀림
4. **모던한 UX**: 최신 웹 앱들의 표준 패턴

**현재 상태 (완벽히 정상 작동):**
```typescript
// src/app/(dashboard)/projects/[id]/settings/page.tsx
if (isLoading) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
```

**제안하는 개선 (순수 미적 개선):**
```typescript
if (isLoading) {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" /> {/* Page title */}
      <Skeleton className="h-32 w-full" /> {/* Alert settings card */}
      <Skeleton className="h-48 w-full" /> {/* API keys card */}
    </div>
  );
}
```

**중요 참고사항:**
- 이 스토리는 **순수 미적/UX 개선**입니다
- 현재 스피너 구현은 **완벽히 작동**하며 문제가 없습니다
- PR #45의 loading state 개선이 선행되어야 합니다
- 낮은 우선순위(LOW)이며, 시간이 있을 때 진행해도 됩니다

---

## Related Work

**선행 작업 (필수):**
- ✅ PR #45: Loading states to prevent premature UI rendering
  - isLoading 체크가 모든 필수 페이지에 추가됨
  - isError 상태에서 에러 메시지 표시 추가됨

**이 스토리의 범위:**
- 기존 스피너를 스켈레톤 로더로 교체 (순수 미적 개선)
- 기능적 변경 없음 (loading 체크는 이미 완료)

---

## Acceptance Criteria

### 필수 요구사항

#### 1. Skeleton Component 구현
- [ ] shadcn/ui Skeleton 컴포넌트 설치
- [ ] 기본 Skeleton 컴포넌트 설정 확인
- [ ] 다양한 크기와 모양의 스켈레톤 패턴 정의

#### 2. Dashboard 페이지 스켈레톤
- [ ] 통계 카드(4개) 스켈레톤 구현
- [ ] 비용 차트 스켈레톤 구현
- [ ] 최근 활동 목록 스켈레톤 구현

#### 3. Settings 페이지 스켈레톤
- [ ] 페이지 제목 스켈레톤
- [ ] 알림 설정 카드 스켈레톤
- [ ] API 키 목록 스켈레톤

#### 4. Projects 페이지 스켈레톤
- [ ] 프로젝트 카드 그리드 스켈레톤
- [ ] 헤더 섹션 스켈레톤

#### 5. Reports 페이지 스켈레톤
- [ ] 리포트 목록 스켈레톤
- [ ] 상세 보기 패널 스켈레톤

#### 6. 일관성 확보
- [ ] 모든 스켈레톤이 실제 콘텐츠 레이아웃과 일치
- [ ] 애니메이션 일관성 (pulse 효과)
- [ ] 색상 일관성 (muted background)

---

## Technical Implementation

### 1. shadcn/ui Skeleton 설치

```bash
bunx shadcn@latest add skeleton
```

**생성되는 파일:**
```typescript
// src/components/ui/skeleton.tsx
import { cn } from "~/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
```

### 2. Dashboard Page Skeleton

**src/app/(dashboard)/dashboard/page.tsx:**
```typescript
"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" /> {/* "Dashboard" title */}
        <Skeleton className="h-4 w-64" /> {/* Subtitle */}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" /> {/* Card title */}
              <Skeleton className="h-4 w-4 rounded" /> {/* Icon */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" /> {/* Main value */}
              <Skeleton className="mt-2 h-3 w-40" /> {/* Description */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" /> {/* Chart area */}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = api.dashboard.getStats.useQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // ... rest of component
}
```

### 3. Settings Page Skeleton

**src/app/(dashboard)/projects/[id]/settings/page.tsx:**
```typescript
"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" /> {/* "Project Settings" */}
        <Skeleton className="h-4 w-96" /> {/* Description */}
      </div>

      {/* Alert Settings Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" /> {/* "Alert Settings" */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Select input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" /> {/* Number input */}
          </div>
          <Skeleton className="h-10 w-32" /> {/* Submit button */}
        </CardContent>
      </Card>

      {/* API Keys Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" /> {/* "Admin API Keys" */}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" /> {/* Key name */}
                  <Skeleton className="h-3 w-32" /> {/* Status */}
                </div>
                <Skeleton className="h-8 w-8 rounded" /> {/* Action button */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading } = api.project.getById.useQuery(
    { id: projectId },
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  );

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  // ... rest of component
}
```

### 4. Projects Page Skeleton

**src/app/(dashboard)/projects/page.tsx:**
```typescript
"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

function ProjectsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" /> {/* "Projects" title */}
        <Skeleton className="h-10 w-40" /> {/* Create button */}
      </div>

      {/* Project Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" /> {/* Project name */}
              <Skeleton className="mt-2 h-4 w-1/2" /> {/* Team name */}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="mt-4 h-9 w-full" /> {/* View button */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = api.project.getAll.useQuery();

  if (isLoading) {
    return <ProjectsSkeleton />;
  }

  // ... rest of component
}
```

### 5. Reports Page Skeleton

**src/app/(dashboard)/reports/page.tsx:**
```typescript
"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

function ReportsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Skeleton className="h-8 w-32" /> {/* "Reports" title */}

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-5 rounded" /> {/* Icon */}
                <Skeleton className="h-4 w-24" /> {/* Date */}
              </div>
              <Skeleton className="mt-2 h-6 w-3/4" /> {/* Report title */}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: reports, isLoading } = api.report.getRecentReports.useQuery(
    { limit: 12 },
    {
      staleTime: Infinity,
      gcTime: 60 * 60 * 1000,
    }
  );

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  // ... rest of component
}
```

### 6. Reusable Skeleton Components

**src/components/skeletons/card-skeleton.tsx (NEW FILE):**
```typescript
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-40" />
      </CardContent>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-4 h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export function ReportCardSkeleton() {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-2 h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
```

**사용 예시:**
```typescript
import { ProjectCardSkeleton } from "~/components/skeletons/card-skeleton";

function ProjectsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

---

## Design Considerations

### 1. 스켈레톤 크기 정확도

**목표:** 실제 콘텐츠와 최대한 유사한 레이아웃

**방법:**
1. 실제 콘텐츠를 Chrome DevTools로 측정
2. 높이(height)는 정확히 일치시키기
3. 너비(width)는 대략적으로 (50%, 75% 등)

### 2. 애니메이션

**기본 animate-pulse 사용:**
```typescript
<Skeleton className="animate-pulse rounded-md bg-muted" />
```

**커스텀 애니메이션 (선택사항):**
```css
/* tailwind.config.ts */
{
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
}
```

### 3. 접근성 (Accessibility)

**ARIA 속성 추가:**
```typescript
function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard content"
      className="space-y-8"
    >
      {/* Skeleton content */}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

---

## Testing Plan

### 1. Visual Regression Testing

```typescript
// __tests__/visual/skeleton-states.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Skeleton States", () => {
  test("Dashboard skeleton matches layout", async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route("**/api/trpc/dashboard.getStats*", async (route) => {
      // Delay response to capture skeleton
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/dashboard");

    // Capture skeleton state
    await expect(page).toHaveScreenshot("dashboard-skeleton.png");
  });

  test("Settings skeleton matches layout", async ({ page }) => {
    await page.route("**/api/trpc/project.getById*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/projects/test-id/settings");
    await expect(page).toHaveScreenshot("settings-skeleton.png");
  });
});
```

### 2. Accessibility Testing

```typescript
// __tests__/a11y/skeleton-accessibility.test.tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DashboardSkeleton } from "~/components/skeletons";

expect.extend(toHaveNoViolations);

describe("Skeleton Accessibility", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<DashboardSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper ARIA attributes", () => {
    const { getByRole } = render(<DashboardSkeleton />);
    const skeleton = getByRole("status");
    expect(skeleton).toHaveAttribute("aria-live", "polite");
  });
});
```

### 3. Performance Testing

```typescript
// __tests__/performance/skeleton-rendering.test.tsx
import { render } from "@testing-library/react";
import { DashboardSkeleton } from "~/components/skeletons";

describe("Skeleton Performance", () => {
  it("should render quickly", () => {
    const startTime = performance.now();
    render(<DashboardSkeleton />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(50); // Should render in < 50ms
  });

  it("should not cause layout shifts", () => {
    const { container, rerender } = render(<DashboardSkeleton />);
    const initialHeight = container.clientHeight;

    // Re-render multiple times
    for (let i = 0; i < 10; i++) {
      rerender(<DashboardSkeleton />);
    }

    const finalHeight = container.clientHeight;
    expect(finalHeight).toBe(initialHeight); // Height should be stable
  });
});
```

---

## Rollout Plan

### Phase 1: Core Pages (Week 1)
- [ ] Install skeleton component
- [ ] Dashboard page skeleton
- [ ] Projects page skeleton
- [ ] Visual testing setup

### Phase 2: Detail Pages (Week 2)
- [ ] Settings page skeleton
- [ ] Reports page skeleton
- [ ] Team members page skeleton
- [ ] A11y testing

### Phase 3: Polish & Optimization (Week 3)
- [ ] Create reusable skeleton components
- [ ] Performance optimization
- [ ] Documentation
- [ ] Team review

---

## Migration Strategy

### Before (Spinner - 완벽히 작동)
```typescript
if (isLoading) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
```

### After (Skeleton - 더 나은 UX)
```typescript
if (isLoading) {
  return <DashboardSkeleton />;
}
```

**마이그레이션 체크리스트:**
- [ ] 기존 spinner 동작 확인
- [ ] Skeleton 컴포넌트 생성
- [ ] 실제 레이아웃과 비교
- [ ] 교체 및 테스트
- [ ] Visual regression 테스트

---

## Definition of Done

- [ ] shadcn/ui Skeleton 컴포넌트 설치 완료
- [ ] Dashboard, Projects, Settings, Reports 페이지 스켈레톤 구현
- [ ] 모든 스켈레톤이 실제 레이아웃과 일치
- [ ] ARIA 속성 추가로 접근성 확보
- [ ] Visual regression 테스트 통과
- [ ] A11y 테스트 통과
- [ ] 성능 테스트 통과 (렌더링 < 50ms)
- [ ] 재사용 가능한 skeleton 컴포넌트 라이브러리 구축
- [ ] 문서화 완료
- [ ] 팀 리뷰 및 승인

---

## Dependencies

**Blocked By:**
- ✅ PR #45: Loading states to prevent premature UI rendering

**Blocks:**
- None

---

## Estimation

**Story Points:** 3

**Time Estimate:**
- Skeleton 설치 및 설정: 0.5시간
- Dashboard 스켈레톤: 1.5시간
- Projects 스켈레톤: 1시간
- Settings 스켈레톤: 1.5시간
- Reports 스켈레톤: 1시간
- 재사용 컴포넌트 추출: 1.5시간
- 테스트 작성: 2시간
- Visual regression 설정: 1시간
- **Total:** ~10시간

---

## References

- [shadcn/ui Skeleton Component](https://ui.shadcn.com/docs/components/skeleton)
- [Skeleton Screens Best Practices](https://www.nngroup.com/articles/skeleton-screens/)
- [PR #45: Loading states improvement](https://github.com/jawsbaek/finops-for-ai-sds/pull/45)
- [Luke Wroblewski - Skeleton Screens](https://www.lukew.com/ff/entry.asp?1797)

---

## Technical Notes

### 스피너 vs 스켈레톤

**스피너의 장점:**
- ✅ 구현이 매우 간단
- ✅ 범용적으로 사용 가능
- ✅ 작은 화면 공간 사용

**스켈레톤의 장점:**
- ✅ 더 나은 perceived performance
- ✅ 레이아웃 미리 보기
- ✅ Layout shift 방지
- ✅ 모던한 UX

**결론:**
- 현재 스피너 구현은 완벽히 작동하며 문제 없음
- 스켈레톤은 UX 개선을 위한 선택적 업그레이드
- 시간과 리소스가 허락할 때 진행

### 성능 고려사항

**스켈레톤이 더 무거울까?**
- Skeleton: ~100줄의 JSX
- Spinner: ~5줄의 JSX

하지만:
- 스켈레톤은 정적 마크업 (렌더링 빠름)
- 스피너는 CSS 애니메이션 (GPU 가속)
- 실제 성능 차이는 미미함 (< 10ms)

**메모리 사용량:**
- 스켈레톤: 약간 더 많은 DOM 노드
- 하지만 로딩 중에만 존재 (일시적)
- 실제 영향은 무시할 수 있는 수준
