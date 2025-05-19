import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionsRouter = createTRPCRouter({
	like: protectedProcedure
		.input(z.object({ videoId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { videoId } = input;
			const { id: userId } = ctx.user;

			const [existVideoReaction] = await db
				.select()
				.from(videoReactions)
				.where(and(
					eq(videoReactions.videoId, videoId),
					eq(videoReactions.userId, userId),
					eq(videoReactions.type, 'like'),
				));

			if (existVideoReaction) {
				const [deleteVideoReaction] = await db
					.delete(videoReactions)
					.where(
						and(
							eq(videoReactions.userId, userId),
							eq(videoReactions.videoId, videoId),
						)
					)
					.returning();

				return deleteVideoReaction;
			}

			const [createdVideoReaction] = await db
				.insert(videoReactions)
				.values({ userId, videoId, type: 'like' })
				.onConflictDoUpdate({
					target: [videoReactions.userId, videoReactions.videoId],
					set: { type: 'like' }
				})
				.returning();

			return createdVideoReaction;
		}),
	dislike: protectedProcedure
		.input(z.object({ videoId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { videoId } = input;
			const { id: userId } = ctx.user;

			const [existVideoReaction] = await db
				.select()
				.from(videoReactions)
				.where(and(
					eq(videoReactions.videoId, videoId),
					eq(videoReactions.userId, userId),
					eq(videoReactions.type, 'dislike'),
				));

			if (existVideoReaction) {
				const [deleteVideoReaction] = await db
					.delete(videoReactions)
					.where(
						and(
							eq(videoReactions.userId, userId),
							eq(videoReactions.videoId, videoId),
						)
					)
					.returning();

				return deleteVideoReaction;
			}

			const [createdVideoReaction] = await db
				.insert(videoReactions)
				.values({ userId, videoId, type: 'dislike' })
				.onConflictDoUpdate({
					target: [videoReactions.userId, videoReactions.videoId],
					set: { type: 'dislike' }
				})
				.returning();

			return createdVideoReaction;
		}),
});
