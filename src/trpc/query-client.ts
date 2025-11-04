import {
	QueryClient,
	defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

/**
 * Create a React Query client with optimized caching settings
 *
 * Performance optimization (Story 1.12):
 * - Default staleTime: 1 minute (reduces unnecessary refetches)
 * - Default cacheTime: 5 minutes (keeps data in memory)
 * - Disabled refetchOnWindowFocus (reduces server load)
 *
 * Per-query customization (override in components as needed):
 * - Team/Project members: staleTime: 5 * 60 * 1000 (5 min, rarely changes)
 * - API keys: staleTime: 1 * 60 * 1000 (1 min, may change more often)
 * - Project details: staleTime: 30 * 1000 (30 sec, frequently viewed)
 */
export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000, // 1 minute default (optimized from 30s)
				gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
				refetchOnWindowFocus: false, // Reduce unnecessary refetches
				retry: 1, // Reduce retry attempts (fail faster)
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});
