# Internationalization (i18n) Structure

## 현재 상태 (Current Status)

- **기본 언어**: 한국어 (Korean)
- **지원 언어**: 한국어 (ko) - 완전 구현됨
- **준비된 언어**: 영어 (en) - 번역 완료, 활성화 대기 중

## 파일 구조

```
src/lib/i18n/
├── index.ts              # Main i18n module, exports hooks and utilities
├── types.ts              # Type definitions for locales
├── messages.ko.ts        # Korean translations (ACTIVE)
├── messages.en.ts        # English translations (PREPARED)
└── README.md            # This file
```

## 사용 방법 (Usage)

### React 컴포넌트에서 사용

```tsx
import { useTranslations } from '~/lib/i18n';

function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t.project.title}</h1>
      <button>{t.common.save}</button>
      <p>{t.errors.PROJECT_NOT_FOUND}</p>
    </div>
  );
}
```

### 서버 사이드에서 사용

```typescript
import { getServerTranslations } from '~/lib/i18n';

export async function myServerFunction() {
  const t = getServerTranslations();

  throw new TRPCError({
    code: "NOT_FOUND",
    message: t.errors.PROJECT_NOT_FOUND,
  });
}
```

## 메시지 카테고리

### 1. `errors` - 에러 메시지
모든 백엔드 에러 메시지. `ERROR_MESSAGES` 상수에서 import됨.

```typescript
t.errors.TEAM_NOT_FOUND
t.errors.PROJECT_ACCESS_DENIED
t.errors.API_KEY_INVALID_FORMAT
```

### 2. `common` - 공통 UI 요소
버튼, 레이블 등 자주 사용되는 UI 텍스트.

```typescript
t.common.save        // "저장"
t.common.cancel      // "취소"
t.common.loading     // "로딩 중..."
```

### 3. `auth` - 인증 관련
로그인, 회원가입 화면의 텍스트.

```typescript
t.auth.login         // "로그인"
t.auth.email         // "이메일"
t.auth.password      // "비밀번호"
```

### 4. `team` - 팀 관리
팀 생성, 멤버 관리 관련 텍스트.

```typescript
t.team.createTeam    // "팀 생성"
t.team.members       // "멤버"
```

### 5. `project` - 프로젝트 관리
프로젝트, API 키 관련 텍스트.

```typescript
t.project.createProject  // "프로젝트 생성"
t.project.apiKeys        // "API 키"
```

### 6. `cost` - 비용 관리
비용 데이터 표시 관련 텍스트.

```typescript
t.cost.totalCost     // "총 비용"
t.cost.costTrend     // "비용 추이"
```

### 7. `validation` - 폼 검증
Zod 스키마 등에서 사용하는 검증 메시지.

```typescript
t.validation.required          // "필수 입력 항목입니다"
t.validation.emailInvalid      // "올바른 이메일 주소를 입력해주세요"
```

## 향후 영어 지원 활성화 방법

영어 지원이 필요할 때 다음 단계를 따르세요:

### 1. 사용자 언어 설정 DB 스키마 추가

```prisma
// prisma/schema.prisma
model User {
  // ... existing fields
  locale  String  @default("ko")  // "ko" | "en"
}
```

### 2. 언어 선택 UI 추가

```tsx
// src/app/_components/LanguageSelector.tsx
import { useTranslations } from '~/lib/i18n';

export function LanguageSelector() {
  const [locale, setLocale] = useState<Locale>('ko');

  const handleChange = async (newLocale: Locale) => {
    // Save to database
    await api.user.updateLocale.mutate({ locale: newLocale });
    setLocale(newLocale);
  };

  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      <option value="ko">한국어</option>
      <option value="en">English</option>
    </select>
  );
}
```

### 3. Context/Provider 추가

```tsx
// src/lib/i18n/provider.tsx
'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './types';

const LocaleContext = createContext<Locale>('ko');

export function LocaleProvider({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
```

### 4. useTranslations Hook 업데이트

```typescript
// src/lib/i18n/index.ts
export function useTranslations() {
  const locale = useLocale(); // Read from context
  return getTranslations(locale);
}
```

### 5. Server Component에서 사용

```tsx
// app/[locale]/layout.tsx
import { LocaleProvider } from '~/lib/i18n/provider';

export default function LocaleLayout({
  params: { locale },
  children,
}: {
  params: { locale: Locale };
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  );
}
```

## 새 번역 추가하기

### 1. 한국어 메시지 추가

```typescript
// src/lib/i18n/messages.ko.ts
export const messages = {
  // ... existing

  newCategory: {
    newMessage: "새로운 메시지",
  },
} as const;
```

### 2. 영어 메시지 추가

```typescript
// src/lib/i18n/messages.en.ts
export const messages: Messages = {
  // ... existing

  newCategory: {
    newMessage: "New message",
  },
} as const;
```

### 3. 사용

```typescript
const t = useTranslations();
console.log(t.newCategory.newMessage);
```

## 주의사항

1. **타입 안정성**: TypeScript가 모든 번역 키를 검증합니다
2. **일관성**: 새 메시지는 반드시 `messages.ko.ts`와 `messages.en.ts` 모두에 추가
3. **에러 메시지**: 백엔드 에러는 `ERROR_MESSAGES`를 직접 사용하지 말고 `t.errors.*` 사용
4. **기본값**: 항상 한국어가 기본값입니다

## Migration Path (향후 마이그레이션)

현재 `ERROR_MESSAGES`를 직접 import하는 코드들:

```typescript
// Before
import { ERROR_MESSAGES } from '~/lib/error-messages';
throw new TRPCError({ message: ERROR_MESSAGES.TEAM_NOT_FOUND });

// After (when i18n is activated)
import { getServerTranslations } from '~/lib/i18n';
const t = getServerTranslations();
throw new TRPCError({ message: t.errors.TEAM_NOT_FOUND });
```

하지만 현재는 두 방식 모두 동일한 한국어 메시지를 반환하므로 점진적 마이그레이션이 가능합니다.
