-- Add partial unique index to prevent multiple active API keys per team/provider
-- This ensures only one active API key can exist for a given team and provider combination
-- Inactive keys can exist multiple times (for historical records)

CREATE UNIQUE INDEX "unique_active_api_key_per_team"
ON "api_keys" ("team_id", "provider")
WHERE "is_active" = true;
