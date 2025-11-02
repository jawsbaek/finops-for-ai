/**
 * Formatting utilities for currency, percentages, and status
 */

/**
 * Format a number as currency in USD with Korean locale
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "US$1,234.56")
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("ko-KR", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

/**
 * Format a number as a percentage change with sign
 * @param change - The percentage change value
 * @returns Formatted percentage string (e.g., "+12.5%" or "-3.2%")
 */
export function formatChange(change: number): string {
	const sign = change > 0 ? "+" : "";
	return `${sign}${change.toFixed(1)}%`;
}

/**
 * Determine trend direction based on numeric change
 * @param change - The numeric change value
 * @returns Trend indicator: "up" for positive, "down" for negative, "neutral" for zero
 */
export function getTrend(change: number): "up" | "down" | "neutral" {
	if (change > 0) return "up";
	if (change < 0) return "down";
	return "neutral";
}

/**
 * Determine project status based on efficiency metric
 * @param efficiency - Efficiency value (success count / cost)
 * @returns Status level: "critical" (< 5), "warning" (< 10), or "normal"
 */
export function getProjectStatus(
	efficiency: number | null,
): "normal" | "warning" | "critical" {
	// Critical: Low efficiency (<5)
	if (efficiency !== null && efficiency < 5) return "critical";

	// Warning: Medium efficiency (5-10)
	if (efficiency !== null && efficiency < 10) return "warning";

	return "normal";
}
