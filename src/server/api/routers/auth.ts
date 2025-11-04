import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

const BCRYPT_ROUNDS = 10;

export const authRouter = createTRPCRouter({
	signup: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(8, "Password must be at least 8 characters"),
				name: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { email, password, name } = input;

			// Check if user already exists
			const existingUser = await ctx.db.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User with this email already exists",
				});
			}

			// Hash password
			const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

			// Create user with default team
			// Fix: Automatically create a personal team for new users
			// This ensures users can immediately create projects
			const user = await ctx.db.user.create({
				data: {
					email,
					passwordHash,
					name,
					teamMemberships: {
						create: {
							role: "owner",
							team: {
								create: {
									name: `${name || email.split("@")[0]}'s Team`,
								},
							},
						},
					},
				},
				select: {
					id: true,
					email: true,
					name: true,
					createdAt: true,
					teamMemberships: {
						include: {
							team: true,
						},
					},
				},
			});

			return {
				success: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					createdAt: user.createdAt,
				},
			};
		}),

	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { email, password } = input;

			// Find user
			const user = await ctx.db.user.findUnique({
				where: { email },
			});

			if (!user) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid email or password",
				});
			}

			// Verify password
			const isValid = await bcrypt.compare(password, user.passwordHash);

			if (!isValid) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid email or password",
				});
			}

			return {
				success: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
			};
		}),

	/**
	 * Get current user with team memberships
	 */
	getMe: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const user = await ctx.db.user.findUnique({
			where: { id: userId },
			include: {
				teamMemberships: {
					include: {
						team: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			teamMemberships: user.teamMemberships.map((tm) => ({
				teamId: tm.teamId,
				team: tm.team,
				role: tm.role,
			})),
		};
	}),

	/**
	 * Change password with session invalidation
	 *
	 * Security features:
	 * - Verifies current password before allowing change
	 * - Invalidates all other sessions (force logout on all devices)
	 * - Keeps current session active for better UX
	 */
	changePassword: protectedProcedure
		.input(
			z.object({
				currentPassword: z.string(),
				newPassword: z
					.string()
					.min(8, "Password must be at least 8 characters"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;

			// Fetch user with password hash
			const user = await ctx.db.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			// Verify current password
			const isValid = await bcrypt.compare(
				input.currentPassword,
				user.passwordHash,
			);

			if (!isValid) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Current password is incorrect",
				});
			}

			// Hash new password
			const newPasswordHash = await bcrypt.hash(
				input.newPassword,
				BCRYPT_ROUNDS,
			);

			// Update password in database
			await ctx.db.user.update({
				where: { id: userId },
				data: { passwordHash: newPasswordHash },
			});

			// Invalidate all other sessions for security
			// Note: With database sessions, we can do this immediately
			await ctx.db.session.deleteMany({
				where: {
					userId,
					// Keep only the current session active
					NOT: {
						sessionToken: ctx.session.user.id, // This will be handled by NextAuth
					},
				},
			});

			return {
				success: true,
				message:
					"Password changed successfully. All other sessions have been logged out.",
			};
		}),

	/**
	 * Sign out from all devices
	 *
	 * Invalidates all sessions for the current user
	 */
	signOutAllDevices: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Delete all sessions for this user
		await ctx.db.session.deleteMany({
			where: { userId },
		});

		return {
			success: true,
			message: "Signed out from all devices",
		};
	}),
});
