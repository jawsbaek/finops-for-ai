# Epic Technical Specification: 프로젝트 기반 및 OpenAI 비용 관리 시스템

Date: 2025-11-01
Author: Issac
Epic ID: 1
Status: Draft

---

## Overview

Epic 1은 FinOps for AI 플랫폼의 핵심 기능을 구축하는 첫 번째 단계입니다. OpenAI API 비용 추적, 실시간 비용 폭주 방지, 행동 유도 리포트를 통해 즉각적인 가치를 제공합니다. 이 Epic은 PRD의 Phase 1A 핵심 가설인 "비용-가치 연결이 실제 의사결정을 개선하는가?"를 검증하는 데 초점을 맞춥니다.

T3 Stack (Next.js 16 + tRPC + Prisma + NextAuth)을 기반으로 구축되며, Vercel에 배포되고 Neon PostgreSQL을 사용합니다. 두 가지 Novel Patterns(비용-가치 연결, 아키텍처 기반 귀속)를 구현하여 기존 FinOps 도구와 차별화합니다.

## Objectives and Scope

**In Scope:**
- ✅ 프로젝트 인프라 및 기본 인증 시스템 (Story 1.1)
- ✅ OpenAI API 비용 일일 배치 수집 (Story 1.2)
- ✅ 비용-가치 컨텍스트 기록 시스템 (Story 1.3)
- ✅ 실시간 비용 임계값 모니터링 및 알림 (Story 1.4)
- ✅ 긴급 API 키 비활성화 메커니즘 (Story 1.5)
- ✅ 주간 리포트 생성 및 발송 (Story 1.6)
- ✅ 팀별 API 키 생성 및 자동 귀속 (Story 1.7)
- ✅ 긴급 조치용 기본 웹 대시보드 (Story 1.8)
- ✅ Epic 1 통합 테스트 및 검증 (Story 1.9)

**Out of Scope (Phase 2 이후):**
- ❌ AWS/Azure 클라우드 통합 (Epic 2)
- ❌ 사용자 행동 추적 및 피드백 수집 (Epic 2)
- ❌ 고급 대시보드 기능 (드릴다운, 필터링)
- ❌ SSO 인증 (Google, Microsoft)
- ❌ 다국어 지원 (Phase 1은 한국어만)
- ❌ AI 비용 예측 엔진

## System Architecture Alignment

이 Epic은 Architecture 문서의 다음 결정사항을 구현합니다:

**Core Stack (ADR-001):**
- Next.js 16 (App Router) + tRPC v11 + Prisma 6 + NextAuth v5
- Tailwind CSS + shadcn/ui (Premium Indigo 테마)
- Vercel 배포 + Neon PostgreSQL

**Security (ADR-002, ADR-004, ADR-005):**
- AWS KMS Envelope Encryption (API 키 보호)
- NextAuth JWT 기반 인증
- TLS 1.3 (Vercel 자동 제공)

**Background Jobs (ADR-003):**
- Vercel Cron Jobs (일일 배치, 5분 폴링, 주간 리포트)

**Novel Patterns:**
- Pattern 1: 비용-가치 연결 (Context Tracker + Value Metrics + Efficiency Calculator)
- Pattern 2: 아키텍처 기반 귀속 (API Key Manager + Cost Attribution Engine)

**Constraints:**
- Serverless 함수 최대 실행 시간: 5분 (Vercel Pro)
- 데이터베이스 연결: Neon serverless connection pooling
- NFR001: 대시보드 로딩 <3초 (P95)
- NFR002: 알림 지연 <5분
- NFR003: 가동률 99.5% 이상

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs | Owner Story |
|--------|---------------|--------|---------|-------------|
| **Authentication Service** | 사용자 인증 및 세션 관리 | Email, Password | JWT Token, Session | Story 1.1 |
| **OpenAI Cost Collector** | OpenAI API 사용량 일일 수집 | API Keys, Date | Cost Records | Story 1.2 |
| **Context Tracker** | API 호출 메타데이터 기록 | Project ID, Task Type, User Intent | Contextualized Cost Data | Story 1.3 |
| **Threshold Monitor** | 비용 임계값 모니터링 (5분 폴링) | Cost Data, Alert Rules | Alert Events | Story 1.4 |
| **Notification Service** | Slack/Email 알림 발송 | Alert Events | Notifications Sent | Story 1.4 |
| **API Key Manager** | API 키 암호화/복호화 (KMS) | Plain API Key, Team ID | Encrypted Key Record | Story 1.5, 1.7 |
| **Report Generator** | 주간 리포트 생성 | Cost Data, Metrics | HTML/JSON Report | Story 1.6 |
| **Efficiency Calculator** | 비용 대비 성과 계산 | Cost Data, Project Metrics | Efficiency Scores | Story 1.6, 1.8 |
| **Dashboard API** | tRPC 엔드포인트 제공 | User Session | Dashboard Data | Story 1.8 |

### Data Models and Contracts

**Core Entities (Prisma Schema):**

```prisma
// 사용자 (Story 1.1)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password_hash String
  name          String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  sessions      Session[]
  teams         TeamMember[]

  @@map("users")
}

// 팀 (Story 1.7)
model Team {
  id         String   @id @default(cuid())
  name       String
  created_at DateTime @default(now())

  members    TeamMember[]
  api_keys   ApiKey[]
  cost_data  CostData[]

  @@map("teams")
}

// API 키 (Story 1.5, 1.7 - KMS 암호화)
model ApiKey {
  id                 String   @id @default(cuid())
  team_id            String
  provider           String   // "openai"
  encrypted_key      String   @db.Text
  encrypted_data_key String   @db.Text
  iv                 String
  is_active          Boolean  @default(true)
  created_at         DateTime @default(now())

  team      Team       @relation(fields: [team_id], references: [id], onDelete: Cascade)
  cost_data CostData[]

  @@index([team_id, provider])
  @@map("api_keys")
}

// 프로젝트 (Story 1.3)
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  team_id     String
  created_at  DateTime @default(now())

  cost_data CostData[]
  metrics   ProjectMetrics?

  @@map("projects")
}

// 프로젝트 성과 메트릭 (Novel Pattern 1 - Story 1.3)
model ProjectMetrics {
  id             String  @id @default(cuid())
  project_id     String  @unique
  success_count  Int     @default(0)
  feedback_score Float?  // 1-5 평균

  project Project @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@map("project_metrics")
}

// 비용 데이터 (Story 1.2, 1.3)
model CostData {
  id          String   @id @default(cuid())
  team_id     String
  project_id  String?
  api_key_id  String
  provider    String   // "openai"
  service     String   // "gpt-4", "gpt-3.5-turbo"
  model       String?
  tokens      Int?
  cost        Decimal  @db.Decimal(10,2)
  date        DateTime @db.Date

  // Novel Pattern 1: Context
  task_type   String?
  user_intent String?

  created_at  DateTime @default(now())

  team    Team    @relation(fields: [team_id], references: [id])
  project Project? @relation(fields: [project_id], references: [id])
  api_key ApiKey  @relation(fields: [api_key_id], references: [id])

  @@index([team_id, date])
  @@index([project_id, date])
  @@map("cost_data")
}

// 비용 임계값 알림 (Story 1.4)
model CostAlert {
  id              String   @id @default(cuid())
  project_id      String
  threshold_type  String   // "daily" | "weekly"
  threshold_value Decimal  @db.Decimal(10,2)
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())

  @@map("cost_alerts")
}

// Cron Job 실행 로그 (Idempotency - Story 1.2, 1.4, 1.6)
model CronLog {
  id       String   @id @default(cuid())
  job_name String
  date     String   // YYYY-MM-DD
  executed_at DateTime @default(now())

  @@unique([job_name, date])
  @@map("cron_logs")
}
```

**Key Relationships:**
- Team 1:N ApiKey (팀별 고유 키)
- Team 1:N CostData (자동 귀속)
- ApiKey 1:N CostData (키로 비용 추적)
- Project 1:1 ProjectMetrics (비용-가치 연결)

### APIs and Interfaces

**tRPC Routers:**

```typescript
// src/server/api/routers/auth.ts (Story 1.1)
export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // bcrypt hash + JWT 발급
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // 인증 + JWT 발급
    })
});

// src/server/api/routers/project.ts (Story 1.3, 1.8)
export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // 사용자 팀의 모든 프로젝트 + 최근 30일 비용
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // 프로젝트 상세 + 비용 추이
    }),

  updateMetrics: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      successCount: z.number().int().min(0),
      feedbackScore: z.number().min(1).max(5).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Novel Pattern 1: 성과 메트릭 업데이트
    })
});

// src/server/api/routers/team.ts (Story 1.7)
export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // 팀 생성 + OpenAI API 키 발급 (Novel Pattern 2)
    }),

  generateApiKey: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      provider: z.literal("openai")
    }))
    .mutation(async ({ input, ctx }) => {
      // KMS 암호화 후 저장
    })
});

// src/server/api/routers/cost.ts (Story 1.4, 1.5, 1.8)
export const costRouter = createTRPCRouter({
  getRecentCosts: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      days: z.number().default(7)
    }))
    .query(async ({ input, ctx }) => {
      // 최근 N일 비용 데이터
    }),

  disableApiKey: protectedProcedure
    .input(z.object({
      apiKeyId: z.string(),
      reason: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // API 키 비활성화 + audit log
    })
});

// src/server/api/routers/alert.ts (Story 1.4)
export const alertRouter = createTRPCRouter({
  setThreshold: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      type: z.enum(["daily", "weekly"]),
      value: z.number().positive()
    }))
    .mutation(async ({ input, ctx }) => {
      // 임계값 설정
    })
});
```

**Cron Job Endpoints:**

```typescript
// src/app/api/cron/daily-batch/route.ts (Story 1.2)
export async function GET(request: Request) {
  // 1. CRON_SECRET 검증
  // 2. Idempotency 체크
  // 3. OpenAI Cost Collector 실행
  // 4. 로그 기록
}

// src/app/api/cron/poll-threshold/route.ts (Story 1.4)
export async function GET(request: Request) {
  // 1. CRON_SECRET 검증
  // 2. Threshold Monitor 실행 (5분마다)
  // 3. 알림 발송 (초과 시)
}

// src/app/api/cron/weekly-report/route.ts (Story 1.6)
export async function GET(request: Request) {
  // 1. CRON_SECRET 검증
  // 2. Report Generator 실행 (월요일 오전 9시)
  // 3. Email 발송
}
```

**External API Integrations:**

```typescript
// OpenAI Usage API (Story 1.2)
GET https://api.openai.com/v1/usage
Headers:
  Authorization: Bearer {OPENAI_API_KEY}
Query:
  date: YYYY-MM-DD

Response:
{
  "data": [
    {
      "aggregation_timestamp": 1234567890,
      "snapshot_id": "abc123",
      "model": "gpt-4",
      "n_requests": 1000,
      "n_context_tokens": 50000,
      "n_generated_tokens": 10000,
      "cost_in_cents": 12345
    }
  ]
}
```

### Workflows and Sequencing

**Workflow 1: 일일 비용 수집 (Story 1.2)**

```
매일 오전 9시 KST (Vercel Cron)
  → GET /api/cron/daily-batch
  → CRON_SECRET 검증
  → Idempotency 체크 (cron_logs 테이블)
  → 모든 팀의 API 키 조회 (teams.api_keys)
  → For each API key:
      → KMS 복호화
      → OpenAI API 호출 (전일 데이터)
      → cost_data 테이블에 저장 (team_id 자동 귀속)
  → Cron log 기록
  → Success 응답
```

**Workflow 2: 실시간 비용 폭주 방지 (Story 1.4)**

```
5분마다 (Vercel Cron)
  → GET /api/cron/poll-threshold
  → CRON_SECRET 검증
  → 모든 활성 프로젝트 임계값 조회 (cost_alerts)
  → For each project:
      → 현재 일일/주간 비용 집계
      → IF 비용 > 임계값:
          → Slack webhook 호출 (즉시)
          → Resend API 호출 (이메일)
          → Throttling (1시간당 최대 1회)
  → 완료
```

**Workflow 3: 주간 리포트 생성 및 발송 (Story 1.6)**

```
매주 월요일 오전 9시 KST (Vercel Cron)
  → GET /api/cron/weekly-report
  → CRON_SECRET 검증
  → 지난 7일 비용 데이터 집계
  → For each team:
      → Efficiency Calculator 실행
          → 비용 대비 성과 계산 (success_count / total_cost)
          → Top 3 / Bottom 3 프로젝트 선정
      → Report Generator 실행
          → React Email 템플릿 렌더링
          → 주간 총 비용, 전주 대비 증감률 계산
      → Resend API로 이메일 발송
      → Report 아카이브 저장
  → 완료
```

**Workflow 4: 긴급 API 키 차단 (Story 1.5)**

```
사용자 대시보드
  → "API 키 비활성화" 버튼 클릭
  → ConfirmationModal 표시 (Type-to-confirm)
  → 사용자가 "차단" 타이핑 후 확인
  → tRPC cost.disableApiKey 호출
  → Prisma:
      → api_keys.is_active = false 업데이트
      → audit_log 기록 (누가, 언제, 왜)
  → Slack 알림 (팀에 차단 통보)
  → Success Toast 표시
```

**Workflow 5: 비용-가치 컨텍스트 기록 (Story 1.3 - Novel Pattern 1)**

```
사용자가 프로젝트 생성
  → tRPC project.create 호출
  → Prisma:
      → projects 테이블에 레코드 생성
      → project_metrics 테이블 초기화

OpenAI API 호출 (via SDK wrapper)
  → Context Tracker가 메타데이터 추가
      → project_id, task_type, user_intent
  → cost_data 테이블에 저장 (컨텍스트 포함)

사용자가 성과 메트릭 입력
  → tRPC project.updateMetrics 호출
  → Prisma:
      → project_metrics.success_count 증가
      → project_metrics.feedback_score 업데이트

주간 리포트 생성 시
  → Efficiency Calculator 실행
      → efficiency = success_count / total_cost
      → 모든 프로젝트 정렬
      → Top 3 / Bottom 3 선정
  → 리포트에 포함
```

## Non-Functional Requirements

### Performance

**NFR001: 대시보드 로딩 시간 <3초 (P95)**
- **구현**:
  - Next.js Server-Side Rendering (SSR)
  - React Query 캐싱 (staleTime: 5분)
  - Prisma connection pooling (Neon)
  - Database 인덱스: `cost_data(team_id, date)`, `cost_data(project_id, date)`
- **측정**: Vercel Analytics + Lighthouse
- **목표**: LCP <2.5초, FID <100ms, CLS <0.1

**NFR002: 알림 지연 <5분**
- **구현**:
  - Vercel Cron (5분 폴링 주기)
  - Slack Webhook (동기 호출, <1초)
  - Resend API (비동기, <5초)
  - Alert throttling (1시간당 최대 1회)
- **측정**: Cron log 타임스탬프 추적
- **목표**: 임계값 초과 감지 → 알림 발송 < 5분

### Security

**NFR004: API 자격증명 AES-256 암호화**
- **구현** (ADR-002):
  - AWS KMS Envelope Encryption
  - AES-256-GCM 알고리즘
  - Data Key: KMS CMK로 보호
  - Encrypted Key + Encrypted Data Key + IV 저장
- **구현 위치**: `src/lib/services/encryption/kms-envelope.ts`
- **영향받는 데이터**: `api_keys.encrypted_key`, `api_keys.encrypted_data_key`

**NFR005: TLS 1.3**
- **구현**: Vercel 자동 제공
- **Headers**:
  - `Strict-Transport-Security: max-age=31536000`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`

**추가 보안**:
- **비밀번호**: bcrypt (10 rounds)
- **세션**: JWT (httpOnly cookie, 30일)
- **Cron Jobs**: Bearer token 인증 (`CRON_SECRET`)

### Reliability/Availability

**NFR003: 가동률 99.5% 이상**
- **구현**:
  - Vercel Edge Network (자동 장애 조치)
  - Neon PostgreSQL (99.95% SLA)
  - Error handling: 모든 tRPC 프로시저에 try-catch
  - Retry logic: OpenAI API 호출 (3회, exponential backoff)
- **측정**: Vercel Analytics + Sentry uptime
- **목표**: 월 최대 3.6시간 다운타임 허용

**데이터 무결성**:
- Cron Job Idempotency (cron_logs 테이블)
- Database 트랜잭션 (Prisma)
- Audit log (api_keys 비활성화)

### Observability

**Logging**:
- **구현**: Pino (JSON structured logging)
- **레벨**: ERROR, WARN, INFO, DEBUG
- **출력**: Vercel Logs + Sentry
- **예시**:
  ```typescript
  logger.error({ userId, projectId, error }, 'Failed to fetch cost data');
  ```

**Monitoring**:
- **Vercel Analytics**: Performance, Core Web Vitals
- **Sentry**: 에러 추적, 스택 트레이스
- **Custom Metrics**:
  - Cron job 성공률
  - 알림 발송 성공률
  - API 응답 시간 (P50, P95, P99)

**Alerting**:
- Sentry 이메일 알림 (Production 에러)
- Vercel 배포 실패 알림

## Dependencies and Integrations

**External Services:**
- OpenAI API (비용 데이터 수집)
- AWS KMS (암호화)
- Resend (이메일 발송)
- Slack Webhook (알림)
- Vercel (호스팅 + Cron)
- Neon PostgreSQL (데이터베이스)

**Package Dependencies (package.json):**

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.2.0",
    "typescript": "^5.1.0",

    "@trpc/server": "^11.7.1",
    "@trpc/client": "^11.7.1",
    "@trpc/react-query": "^11.7.1",
    "@trpc/next": "^11.7.1",

    "prisma": "^6.16.3",
    "@prisma/client": "^6.16.3",

    "next-auth": "^5.0.0",
    "bcrypt": "^5.1.1",
    "@types/bcrypt": "^5.0.0",

    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "latest",

    "recharts": "^2.12.0",
    "@tanstack/react-table": "^8.20.0",
    "@tanstack/react-query": "^5.0.0",

    "@aws-sdk/client-kms": "^3.901.0",
    "resend": "^4.0.0",
    "react-email": "^3.0.0",

    "zod": "^3.22.0",
    "date-fns": "^3.0.0",
    "pino": "^9.0.0",

    "@sentry/nextjs": "^8.0.0"
  },
  "devDependencies": {
    "playwright": "^1.49.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "jest-axe": "^9.0.0"
  }
}
```

**Version Constraints:**
- Node.js: 18.x or 20.x
- PostgreSQL: 14+ (Neon 제공)
- AWS SDK: v3 (latest)
- Next.js: 16.x (App Router 필수)
- tRPC: v11 (v10 호환 안 됨)

**Integration Points:**
- Vercel ↔ GitHub (CI/CD)
- Vercel ↔ Neon (Database)
- Next.js ↔ AWS KMS (Encryption)
- Cron Jobs ↔ External APIs (OpenAI, Resend, Slack)

## Acceptance Criteria (Authoritative)

### Story 1.1: 프로젝트 인프라 및 기본 인증 구축
1. ✅ PostgreSQL 데이터베이스가 구축되고, users, projects, api_keys 테이블이 생성되어야 한다
2. ✅ 이메일/비밀번호 기반 회원가입 및 로그인 API가 작동해야 한다 (JWT 토큰 발급)
3. ✅ 기본 웹 UI가 배포되어야 한다 (로그인 페이지, 홈 화면 뼈대)
4. ✅ HTTPS 연결이 설정되어야 한다 (TLS 1.3, NFR005)
5. ✅ CI/CD 파이프라인이 구축되어 코드 푸시 시 자동 테스트 및 배포가 되어야 한다

### Story 1.2: OpenAI API 비용 일일 배치 수집 시스템
1. ✅ 시스템은 매일 오전 9시 KST에 OpenAI API를 호출하여 전일 사용 내역을 가져와야 한다 (FR001)
2. ✅ 수집된 데이터는 cost_data 테이블에 저장되어야 한다 (날짜, API 키, 모델, 토큰 수, 비용)
3. ✅ 홈 화면에 "어제 총 비용" 및 "이번 주 총 비용"이 표시되어야 한다
4. ✅ 데이터 수집 실패 시 관리자에게 이메일 알림이 발송되어야 한다
5. ✅ API 자격증명은 AES-256으로 암호화되어 저장되어야 한다 (NFR004)

### Story 1.3: 비용-가치 컨텍스트 기록 시스템
1. ✅ 시스템은 API 키 생성 시 프로젝트명을 필수로 입력받아야 한다 (FR007)
2. ✅ 시스템은 API 호출 로그에 컨텍스트 메타데이터를 기록할 수 있는 구조를 제공해야 한다 (FR002)
3. ✅ 프로젝트 상세 페이지에서 "총 비용"과 함께 "주요 작업 유형별 비용 분포"를 표시해야 한다
4. ✅ 사용자가 프로젝트별로 "성과 메트릭"을 입력할 수 있어야 한다 (예: 성공한 작업 수, 사용자 피드백 점수)
5. ✅ 프로젝트 상세 페이지에서 "비용 대비 성과" 차트를 표시해야 한다 (FR003)

### Story 1.4: 실시간 비용 임계값 모니터링 및 알림
1. ✅ 프로젝트 설정 페이지에서 일일/주간 비용 임계값을 설정할 수 있어야 한다 (FR004)
2. ✅ 시스템은 OpenAI API 비용 데이터를 5분마다 확인하여 임계값 초과 여부를 검사해야 한다
3. ✅ 임계값 초과 시 1분 이내에 Slack 및 이메일 알림을 발송해야 한다 (NFR002, FR004)
4. ✅ 알림 메시지는 "프로젝트명, 현재 비용, 임계값, 초과율"을 포함해야 한다
5. ✅ 알림 메시지에 "상세 보기" 링크가 포함되어 대시보드로 즉시 이동할 수 있어야 한다

### Story 1.5: 긴급 API 키 비활성화 메커니즘
1. ✅ 프로젝트 상세 페이지에 "API 키 비활성화" 버튼이 표시되어야 한다
2. ✅ 비활성화 버튼 클릭 시 확인 팝업이 표시되어야 한다 ("이 키를 사용하는 모든 애플리케이션이 중단됩니다")
3. ✅ 확인 시 시스템은 해당 API 키를 즉시 비활성화 상태로 변경해야 한다 (FR005)
4. ✅ 비활성화된 API 키 사용 시도는 시스템에서 차단되어야 한다
5. ✅ API 키 비활성화 이벤트는 audit_log 테이블에 기록되어야 한다 (누가, 언제, 왜)

### Story 1.6: 주간 리포트 생성 및 발송
1. ✅ 시스템은 매주 월요일 오전 9시 KST에 주간 리포트를 자동 생성해야 한다 (FR006)
2. ✅ 리포트는 "가장 비용 효율적인 프로젝트 Top 3" 및 "개선 필요 프로젝트 Top 3"를 포함해야 한다
3. ✅ 각 프로젝트에 대해 "총 비용, 비용 대비 성과, 전주 대비 증감률"을 표시해야 한다
4. ✅ 리포트는 이메일로 모든 등록된 사용자에게 발송되어야 한다
5. ✅ 리포트는 웹 대시보드 "리포트 아카이브" 섹션에도 저장되어야 한다

### Story 1.7: 팀별 API 키 생성 및 자동 귀속
1. ✅ 시스템은 "팀" 엔티티를 생성할 수 있어야 한다 (팀명, 담당자, 예산)
2. ✅ 각 팀에 대해 고유한 OpenAI API 키를 생성하고 관리할 수 있어야 한다 (FR007)
3. ✅ 비용 데이터 수집 시 API 키를 기준으로 팀을 자동 식별해야 한다
4. ✅ 홈 화면에 "팀별 비용 Top 5" 차트가 표시되어야 한다
5. ✅ 팀 관리 페이지에서 API 키 생성, 조회, 비활성화를 할 수 있어야 한다

### Story 1.8: 긴급 조치용 기본 웹 대시보드
1. ✅ 홈 화면에 "전일/전주/전월 총 비용" 카드가 표시되어야 한다
2. ✅ 홈 화면에 "주요 프로젝트 비용 Top 5" 차트가 표시되어야 한다
3. ✅ 프로젝트 상세 페이지에 비용 추이 그래프(최근 30일)가 표시되어야 한다
4. ✅ 프로젝트 상세 페이지에서 임계값 설정 및 API 키 비활성화가 가능해야 한다
5. ✅ 대시보드 초기 로딩 시간은 3초 이내여야 한다 (NFR001)

### Story 1.9: Epic 1 통합 테스트 및 검증
1. ✅ 엔드투엔드 시나리오 테스트가 성공해야 한다 (회원가입 → API 키 생성 → 비용 수집 → 알림 → 비활성화)
2. ✅ 시스템 가동률이 99.5% 이상이어야 한다 (NFR003, 최근 7일 기준)
3. ✅ 실제 사용자 1개 팀이 파일럿 테스트를 완료하고 피드백을 제공해야 한다
4. ✅ 모든 보안 요구사항이 충족되어야 한다 (TLS 1.3, AES-256 암호화, NFR004/NFR005)
5. ✅ 검증 기준 달성: 비용 폭주 알림으로 실제 손실 방지 사례 1건 이상 기록

## Traceability Mapping

| AC ID | Spec Section | Component | API/Interface | Test Idea |
|-------|--------------|-----------|---------------|-----------|
| 1.1.1 | Data Models | Prisma Schema | `prisma/schema.prisma` | Migration 실행 후 테이블 존재 확인 |
| 1.1.2 | APIs | authRouter | `src/server/api/routers/auth.ts` | 회원가입 → 로그인 → JWT 검증 |
| 1.1.3 | UX Components | Login/Signup Pages | `src/app/(auth)/login/page.tsx` | Playwright E2E |
| 1.1.4 | Security | Vercel HTTPS | Vercel 자동 | SSL Labs 테스트 |
| 1.1.5 | Deployment | Vercel CI/CD | `.github/workflows/` | PR → 자동 배포 확인 |
| 1.2.1 | Workflows | OpenAI Cost Collector | `src/lib/services/openai/cost-collector.ts` | Cron job 수동 트리거 |
| 1.2.2 | Data Models | CostData | `prisma/schema.prisma` | 데이터 저장 확인 |
| 1.2.3 | UX Components | StatCard | `src/components/custom/stat-card.tsx` | 비용 표시 확인 |
| 1.2.4 | Services | Notification Service | `src/lib/services/email/` | 실패 시 이메일 발송 |
| 1.2.5 | Security | KMS Encryption | `src/lib/services/encryption/kms-envelope.ts` | 암호화/복호화 테스트 |
| 1.3.1 | APIs | teamRouter.generateApiKey | `src/server/api/routers/team.ts` | 프로젝트명 필수 검증 |
| 1.3.2 | Data Models | CostData (task_type, user_intent) | `prisma/schema.prisma` | 컨텍스트 저장 확인 |
| 1.3.3 | UX Components | CostChart | `src/components/custom/cost-chart.tsx` | 작업 유형별 차트 |
| 1.3.4 | APIs | projectRouter.updateMetrics | `src/server/api/routers/project.ts` | 성과 메트릭 입력 |
| 1.3.5 | Services | Efficiency Calculator | `src/lib/services/reporting/efficiency.ts` | 비용 대비 성과 계산 |
| 1.4.1 | APIs | alertRouter.setThreshold | `src/server/api/routers/alert.ts` | 임계값 설정 |
| 1.4.2 | Workflows | Threshold Monitor | `src/app/api/cron/poll-threshold/route.ts` | 5분 폴링 확인 |
| 1.4.3 | Services | Notification Service | `src/lib/services/slack/`, `src/lib/services/email/` | 알림 발송 시간 측정 |
| 1.4.4 | UX Components | AlertBanner | `src/components/custom/alert-banner.tsx` | 알림 메시지 내용 |
| 1.4.5 | UX | Deep Link | Next.js routing | 링크 클릭 → 프로젝트 상세 |
| 1.5.1 | UX Components | ProjectCard | `src/components/custom/project-card.tsx` | 비활성화 버튼 표시 |
| 1.5.2 | UX Components | ConfirmationModal | `src/components/custom/confirmation-modal.tsx` | Type-to-confirm |
| 1.5.3 | APIs | costRouter.disableApiKey | `src/server/api/routers/cost.ts` | API 키 비활성화 |
| 1.5.4 | Data Models | ApiKey (is_active) | `prisma/schema.prisma` | 비활성화 상태 확인 |
| 1.5.5 | Data Models | Audit Log | TBD (별도 테이블 또는 Sentry) | 로그 기록 확인 |
| 1.6.1 | Workflows | Report Generator | `src/app/api/cron/weekly-report/route.ts` | 월요일 오전 9시 실행 |
| 1.6.2 | Services | Efficiency Calculator | `src/lib/services/reporting/efficiency.ts` | Top 3 / Bottom 3 선정 |
| 1.6.3 | Services | Report Generator | `src/lib/services/reporting/` | 메트릭 계산 |
| 1.6.4 | Services | Email Service | `src/lib/services/email/templates/` | React Email 발송 |
| 1.6.5 | UX | Report Archive | `src/app/(dashboard)/reports/page.tsx` | 저장된 리포트 조회 |
| 1.7.1 | APIs | teamRouter.create | `src/server/api/routers/team.ts` | 팀 생성 |
| 1.7.2 | Services | API Key Manager | `src/lib/services/encryption/api-key-manager.ts` | KMS 암호화 + 저장 |
| 1.7.3 | Workflows | Cost Collector | `src/lib/services/openai/cost-collector.ts` | API 키 → 팀 매핑 |
| 1.7.4 | UX Components | CostChart | `src/components/custom/cost-chart.tsx` | 팀별 비용 차트 |
| 1.7.5 | UX | Team Management Page | `src/app/(dashboard)/teams/page.tsx` | API 키 CRUD |
| 1.8.1 | UX Components | StatCard | `src/components/custom/stat-card.tsx` | 비용 카드 3개 |
| 1.8.2 | UX Components | CostChart | `src/components/custom/cost-chart.tsx` | Top 5 차트 |
| 1.8.3 | UX Components | CostChart | `src/components/custom/cost-chart.tsx` | 30일 추이 그래프 |
| 1.8.4 | UX | Project Detail Page | `src/app/(dashboard)/projects/[id]/page.tsx` | 임계값 + 비활성화 UI |
| 1.8.5 | Performance | Next.js SSR + Caching | Vercel Analytics | Lighthouse 성능 테스트 |
| 1.9.1 | Testing | Playwright E2E | `__tests__/e2e/user-journey.spec.ts` | 전체 시나리오 자동화 |
| 1.9.2 | Monitoring | Vercel Analytics | Vercel Dashboard | 7일 가동률 확인 |
| 1.9.3 | Testing | Pilot User | Manual | 사용자 피드백 수집 |
| 1.9.4 | Security | Security Checklist | Multiple | TLS, KMS, bcrypt 검증 |
| 1.9.5 | Validation | Success Metric | Manual | 실제 손실 방지 사례 문서화 |

## Risks, Assumptions, Open Questions

### Risks

**Risk 1: OpenAI API 사용량 데이터 지연 (8-24시간)**
- **설명**: OpenAI Usage API는 실시간이 아니며, 데이터가 8-24시간 지연될 수 있음
- **영향**: Story 1.2, 1.4 - 실시간 알림이 실제로는 지연될 수 있음
- **완화**:
  - PRD에 명시된 대로 "일일 배치" 수집으로 설계
  - 5분 폴링은 이미 수집된 데이터 기반 임계값 체크
  - 사용자에게 데이터 지연 명시 (UI에 "마지막 업데이트" 표시)

**Risk 2: AWS KMS API 비용 및 지연**
- **설명**: KMS 복호화 호출마다 비용 발생 ($0.03/10,000 requests)
- **영향**: Story 1.2 - 일일 배치에서 모든 API 키 복호화 시 비용
- **완화**:
  - 복호화된 키를 메모리에 캐싱 (Cron job 실행 중)
  - 월 예상 비용: 팀 100개 × 30일 = 3,000 calls = $0.01/월 (무시 가능)

**Risk 3: Vercel Cron Jobs 실행 보장 없음**
- **설명**: Vercel Cron은 best-effort, 정확한 시간 보장 안 됨
- **영향**: Story 1.2, 1.4, 1.6 - Cron job이 지연되거나 실패할 수 있음
- **완화**:
  - Idempotency 체크 (cron_logs 테이블)
  - Retry 로직 (실패 시 Sentry 알림)
  - 수동 트리거 API 제공 (관리자용)

**Risk 4: Neon PostgreSQL cold start**
- **설명**: Serverless DB는 비활성 시 cold start (수 초 지연)
- **영향**: NFR001 - 대시보드 로딩 시간 >3초 가능
- **완화**:
  - Neon Auto-suspend 비활성화 (Pro plan)
  - Prisma connection pooling
  - React Query 캐싱으로 재요청 방지

### Assumptions

**Assumption 1: OpenAI API 키는 팀당 1개만 사용**
- **근거**: Novel Pattern 2 (아키텍처 기반 귀속)
- **검증**: Story 1.7 구현 시 UI에서 강제

**Assumption 2: 사용자는 Chrome/Safari/Edge 최신 버전 사용**
- **근거**: UX Design - Browser Support 명시
- **검증**: Playwright E2E 테스트에서 브라우저 매트릭스 테스트

**Assumption 3: 한국어만 지원 (Phase 1)**
- **근거**: PRD - UX Design Principles, "한국어 우선"
- **검증**: i18n 라이브러리 설치 안 함

**Assumption 4: Phase 1은 Vercel Pro plan 사용**
- **근거**: Cron Jobs 필요 (Hobby는 2개 cron, 1일 1회만)
- **검증**: vercel.json에 3개 cron 정의

### Open Questions

**Question 1: Audit Log 구현 방법?**
- **배경**: Story 1.5 AC5 - API 키 비활성화 이벤트 로그
- **옵션**:
  - A) Prisma 별도 테이블 (`audit_logs`)
  - B) Sentry Event 로그
  - C) JSON 파일 저장
- **결정 필요**: Story 1.5 구현 전
- **추천**: Option A (Prisma 테이블) - 쿼리 가능, 영구 저장

**Question 2: 프로젝트 성과 메트릭 자동 수집 vs 수동 입력?**
- **배경**: Story 1.3 AC4 - "사용자가 프로젝트별로 성과 메트릭 입력"
- **옵션**:
  - A) 수동 입력 (UI 폼)
  - B) SDK wrapper로 자동 수집 (API 호출 시)
  - C) 둘 다 지원
- **결정 필요**: Story 1.3 구현 전
- **추천**: Option C - 자동 수집(기본) + 수동 편집 가능

**Question 3: React Email vs HTML 템플릿?**
- **배경**: Story 1.6 - 주간 리포트 이메일
- **옵션**:
  - A) React Email (컴포넌트 기반)
  - B) HTML 템플릿 (Handlebars)
- **결정**: React Email (Architecture ADR-004 명시)
- **확인**: Story 1.6 구현 시 템플릿 생성

**Question 4: 모바일 앱 vs 반응형 웹?**
- **배경**: UX Design - 모바일 최적화 필수
- **결정**: 반응형 웹만 (Phase 1)
- **확인**: 네이티브 앱은 Out of Scope

## Test Strategy Summary

### Test Levels

**Unit Tests (Vitest)**
- **대상**: 모든 서비스, 유틸리티, Novel Patterns
- **커버리지**: 80% 이상
- **예시**:
  - `kms-envelope.ts`: 암호화/복호화
  - `efficiency.ts`: 비용 대비 성과 계산
  - `cost-collector.ts`: OpenAI API 파싱

**Integration Tests (Vitest + MSW)**
- **대상**: tRPC 프로시저, Prisma 쿼리
- **예시**:
  - `authRouter.signup`: 사용자 생성 + JWT 발급
  - `costRouter.disableApiKey`: API 키 비활성화 + audit log

**E2E Tests (Playwright)**
- **대상**: 3가지 핵심 사용자 여정
- **시나리오**:
  1. 비용 급증 감지 및 즉시 대응 (Story 1.4, 1.5)
  2. 주간 리포트 확인 (Story 1.6, 1.8)
  3. 프로젝트별 비용 드릴다운 (Story 1.3, 1.8)

**Accessibility Tests (jest-axe)**
- **대상**: 모든 주요 화면
- **기준**: WCAG 2.1 AA, Lighthouse Accessibility 95+

### Test Coverage

**AC Coverage:**
- 모든 Acceptance Criteria에 대해 최소 1개 테스트
- Traceability Mapping 테이블 참조

**Edge Cases:**
- API 키 복호화 실패 (KMS 오류)
- OpenAI API 응답 지연/타임아웃
- Database connection pool 소진
- Cron job 동시 실행 (Idempotency)

**Performance Tests:**
- Lighthouse CI (모든 PR)
- Load testing (K6): 동시 사용자 100명
- Database query 성능 (EXPLAIN ANALYZE)

### Test Frameworks

```typescript
// Vitest 설정
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});

// Playwright 설정
// playwright.config.ts
export default defineConfig({
  testDir: './__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'mobile', use: devices['iPhone 13'] }
  ]
});
```

### Test Execution

**CI/CD Pipeline:**
```
GitHub PR → Vercel Preview Deploy
  → Vitest Unit/Integration
  → Playwright E2E
  → Lighthouse CI
  → jest-axe Accessibility
  → All Pass → Merge to Main
  → Main → Vercel Production Deploy
```

**Manual Testing:**
- Pilot User 테스트 (Story 1.9 AC3)
- Exploratory testing (각 Story 완료 후)
- Security review (Story 1.9 AC4)

---

_Epic 1 Technical Specification Generated by BMAD BMM Workflow v6_
_Date: 2025-11-01_
_For: Issac_
_Project: finops-for-ai (Level 2)_
