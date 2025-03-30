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

			const [existVideoReactionLike] = await db
				.select()
				.from(videoReactions)
				.where(and(
					eq(videoReactions.videoId, videoId),
					eq(videoReactions.userId, userId),
					eq(videoReactions.type, 'like'),
				));

			if (existVideoReactionLike) {
				const [deleteVideoReactionLike] = await db
					.delete(videoReactions)
					.where(
						and(
							eq(videoReactions.userId, userId),
							eq(videoReactions.videoId, videoId),
						)
					)
					.returning();

				return deleteVideoReactionLike;
			}

			const [createdVideoReactionLike] = await db
				.insert(videoReactions)
				.values({ userId, videoId, type: 'like' })
				.onConflictDoUpdate({
					target: [videoReactions.userId, videoReactions.videoId],
					set: { type: 'like' }
				})
				.returning();

			return createdVideoReactionLike;
		}),
		dislike: protectedProcedure
		.input(z.object({ videoId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { videoId } = input;
			const { id: userId } = ctx.user;

			const [existVideoReactionDislike] = await db
				.select()
				.from(videoReactions)
				.where(and(
					eq(videoReactions.videoId, videoId),
					eq(videoReactions.userId, userId),
					eq(videoReactions.type, 'dislike'),
				));

			if (existVideoReactionDislike) {
				const [deleteVideoReactionDislike] = await db
					.delete(videoReactions)
					.where(
						and(
							eq(videoReactions.userId, userId),
							eq(videoReactions.videoId, videoId),
						)
					)
					.returning();

				return deleteVideoReactionDislike;
			}

			const [createdVideoReactionDislike] = await db
				.insert(videoReactions)
				.values({ userId, videoId, type: 'dislike' })
				.onConflictDoUpdate({
					target: [videoReactions.userId, videoReactions.videoId],
					set: { type: 'dislike' }
				})
				.returning();

			return createdVideoReactionDislike;
		}),
})