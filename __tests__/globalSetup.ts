import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Global setup for Playwright tests
 * Runs database migrations before test suite starts
 */
export default async function globalSetup() {
	console.log("\n🔧 Running global setup...");

	try {
		// Run Prisma migrations to ensure database schema is up to date
		console.log("📦 Running database migrations...");
		const { stdout, stderr } = await execAsync("bun prisma migrate deploy");

		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);

		console.log("✅ Database migrations completed successfully\n");
	} catch (error) {
		console.error("❌ Failed to run database migrations:", error);
		throw error;
	}
}
