import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				videoId: z.string().uuid(),
				value: z.string(),
				parentId: z.string().uuid().nullish(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { videoId, value, parentId } = input;
			const { id: userId } = ctx.user;
			const [existComment] = await db
				.select()
				.from(comments)
				.where(inArray(comments.id, parentId ? [parentId] : []));
			if (!existComment && parentId) throw new TRPCError({ code: 'NOT_FOUND' });
			if (existComment?.parentId && parentId) throw new TRPCError({ code: 'BAD_REQUEST' });

			const [createdComment] = await db
				.insert(comments)
				.values({ userId, videoId, value, parentId })
				.returning();

			return createdComment;
		}),
	getMany: baseProcedure
		.input(
			z.object({
				videoId: z.string().uuid(),
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				parentId: z.string().uuid().nullish(),
				limit: z.number().min(1).max(100),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { clerkUserId } = ctx;
			const { videoId, cursor, limit, parentId } = input;
			let userId;
			const [user] = await db
				.select()
				.from(users)
				.where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
			if (user) userId = user.id;

			const viewerReactions = db.$with('viewer_reactions').as(
				db
					.select({
						commentId: commentReactions.commentId,
						type: commentReactions.type,
					})
					.from(commentReactions)
					.where(inArray(commentReactions.userId, userId ? [userId] : []))
			);
			const replies = db.$with('replies').as(
				db
					.select({
						parentId: comments.parentId,
						count: count(comments.id).as('count'),
					})
					.from(comments)
					.where(isNotNull(comments.parentId))
					.groupBy(comments.parentId)
			);

			const [data, totalCount] = await Promise.all([
				db
					.with(viewerReactions, replies)
					.select({
						...getTableColumns(comments),
						user: users,
						likeCount: db.$count(
							commentReactions,
							and(
								eq(commentReactions.type, 'like'),
								eq(commentReactions.commentId, comments.id),
							),
						),
						dislikeCount: db.$count(
							commentReactions,
							and(
								eq(commentReactions.type, 'dislike'),
								eq(commentReactions.commentId, comments.id),
							),
						),
						viewerReaction: viewerReactions.type,
						replyCount: replies.count,
					})
					.from(comments)
					.where(
						and(
							eq(comments.videoId, videoId),
							parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
							cursor ? or(
								lt(comments.updatedAt, cursor.updatedAt),
								and(
									eq(comments.updatedAt, cursor.updatedAt),
									lt(comments.id, cursor.id),
								)
							)
								: undefined,
						)
					)
					.innerJoin(users, eq(comments.userId, users.id))
					.leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
					.leftJoin(replies, eq(comments.id, replies.parentId))
					.orderBy(desc(comments.updatedAt))
					/* Add 1 to the limit to check if there is more data. */
					.limit(limit + 1),
				db
					.select({ count: count() })
					.from(comments)
					.where(
						and(
							eq(comments.videoId, videoId),
							/* isNull(comments.parentId), */
						)
					),
			]);
			const hasMore = data.length > limit;
			// Remove the last item if there is more data.
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next curosr to the last item if there is more data.
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

			return { items, nextCursor, count: totalCount[0].count };
		}),
	remove: protectedProcedure
		.input(
			z.object({ id: z.string().uuid() })
		)
		.mutation(async ({ input, ctx }) => {
			const { id } = input;
			const { id: userId } = ctx.user;
			const [deletedComment] = await db
				.delete(comments)
				.where(
					and(
						eq(comments.id, id),
						eq(comments.userId, userId),
					)
				)
				.returning();
			if (!deletedComment) throw new TRPCError({ code: 'NOT_FOUND' });

			return deletedComment;
		}),
});
