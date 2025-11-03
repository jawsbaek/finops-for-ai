# FinOps for AI - SDS

A FinOps platform for AI workloads built with the [T3 Stack](https://create.t3.gg/).

## Getting Started

### Development

```bash
# Install dependencies
bun install

# Start local development database
docker run -d \
  --name finops-test-db \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="test_password" \
  -e POSTGRES_DB="finops_test" \
  -p 5433:5432 \
  postgres:15-alpine

# Run migrations on test database
DATABASE_URL="postgresql://postgres:test_password@localhost:5433/finops_test?schema=public" bunx prisma migrate deploy

# Start development server
bun run dev
```

### Testing

#### E2E Tests (Playwright)

E2E tests require a local test database:

```bash
# 1. Start test database (if not already running)
docker run -d \
  --name finops-test-db \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="test_password" \
  -e POSTGRES_DB="finops_test" \
  -p 5433:5432 \
  postgres:15-alpine

# 2. Run migrations
DATABASE_URL="postgresql://postgres:test_password@localhost:5433/finops_test?schema=public" bunx prisma migrate deploy

# 3. Copy test environment file
cp .env.test.example .env.test

# 4. Run E2E tests
bun run test:e2e

# Optional: Run with UI
bun run test:e2e:ui

# Optional: Debug mode
bun run test:e2e:debug
```

#### Unit Tests (Vitest)

```bash
# Run unit tests
bun run test

# Run with coverage
bun run test:coverage

# Run with UI
bun run test:ui
```

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
