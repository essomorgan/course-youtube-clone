import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const commentReactionsRouter = createTRPCRouter({
	like: protectedProcedure
		.input(z.object({ commentId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { commentId } = input;
			const { id: userId } = ctx.user;

			const [existCommentReaction] = await db
				.select()
				.from(commentReactions)
				.where(and(
					eq(commentReactions.commentId, commentId),
					eq(commentReactions.userId, userId),
					eq(commentReactions.type, 'like'),
				));

			if (existCommentReaction) {
				const [deleteViewerReaction] = await db
					.delete(commentReactions)
					.where(
						and(
							eq(commentReactions.userId, userId),
							eq(commentReactions.commentId, commentId),
						)
					)
					.returning();

				return deleteViewerReaction;
			}

			const [createdCommentReaction] = await db
				.insert(commentReactions)
				.values({ userId, commentId, type: 'like' })
				.onConflictDoUpdate({
					target: [commentReactions.userId, commentReactions.commentId],
					set: { type: 'like' },
				})
				.returning();

			return createdCommentReaction;
		}),
	dislike: protectedProcedure
		.input(z.object({ commentId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { commentId } = input;
			const { id: userId } = ctx.user;

			const [existCommentReaction] = await db
				.select()
				.from(commentReactions)
				.where(and(
					eq(commentReactions.commentId, commentId),
					eq(commentReactions.userId, userId),
					eq(commentReactions.type, 'dislike'),
				));

			if (existCommentReaction) {
				const [deleteViewerReaction] = await db
					.delete(commentReactions)
					.where(
						and(
							eq(commentReactions.userId, userId),
							eq(commentReactions.commentId, commentId),
						)
					)
					.returning();

				return deleteViewerReaction;
			}

			const [createdCommentReaction] = await db
				.insert(commentReactions)
				.values({ userId, commentId, type: 'dislike' })
				.onConflictDoUpdate({
					target: [commentReactions.userId, commentReactions.commentId],
					set: { type: 'dislike' },
				})
				.returning();

			return createdCommentReaction;
		}),
});
