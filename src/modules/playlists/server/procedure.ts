import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const playlistsRouter = createTRPCRouter({
	getHisotry: protectedProcedure
		.input(
			z.object({
				cursor: z.object({
					id: z.string().uuid(),
					viewedAt: z.date(),
				})
					.nullish(),
				limit: z.number().min(1).max(100),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { cursor, limit } = input;
			const { id: userId } = ctx.user;
			const viewerVideoViews = db.$with('viewer_video_views').as(
				db
					.select({
						videoId: videoViews.videoId,
						viewedAt: videoViews.updatedAt,
					})
					.from(videoViews)
					.where(eq(videoViews.userId, userId))
			);
			const data = await db
				.with(viewerVideoViews)
				.select({
					...getTableColumns(videos),
					user: users,
					viewedAt: viewerVideoViews.viewedAt,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
					likeCount: db.$count(videoReactions, and(
						eq(videoReactions.videoId, videos.id),
						eq(videoReactions.type, 'like'),
					)),
					dislikeCount: db.$count(videoReactions, and(
						eq(videoReactions.videoId, videos.id),
						eq(videoReactions.type, 'dislike'),
					)),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
				.where(
					and(
						eq(videos.visibility, 'public'),
						cursor ? or(
							lt(viewerVideoViews.viewedAt, cursor.viewedAt),
							and(
								eq(viewerVideoViews.viewedAt, cursor.viewedAt),
								lt(videos.id, cursor.id),
							)
						)
							: undefined,
					)
				)
				.orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
				/* Add 1 to the limit to check if there is more data. */
				.limit(limit + 1);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data.
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next curosr to the last item if there is more data.
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, viewedAt: lastItem.viewedAt } : null;

			return { items, nextCursor };
		}),
	getLiked: protectedProcedure
		.input(
			z.object({
				cursor: z.object({
					id: z.string().uuid(),
					viewedAt: z.date(),
				})
					.nullish(),
				limit: z.number().min(1).max(100),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { cursor, limit } = input;
			const { id: userId } = ctx.user;
			const viewerLikedViews = db.$with('viewer_video_reactions').as(
				db
					.select({
						videoId: videoReactions.videoId,
						likedAt: videoReactions.updatedAt,
					})
					.from(videoReactions)
					.where(and(
						eq(videoReactions.userId, userId),
						eq(videoReactions.type, 'like'),
					))
			);
			const data = await db
				.with(viewerLikedViews)
				.select({
					...getTableColumns(videos),
					user: users,
					viewedAt: viewerLikedViews.likedAt,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
					likeCount: db.$count(videoReactions, and(
						eq(videoReactions.videoId, videos.id),
						eq(videoReactions.type, 'like'),
					)),
					dislikeCount: db.$count(videoReactions, and(
						eq(videoReactions.videoId, videos.id),
						eq(videoReactions.type, 'dislike'),
					)),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.innerJoin(viewerLikedViews, eq(videos.id, viewerLikedViews.videoId))
				.where(
					and(
						eq(videos.visibility, 'public'),
						cursor ? or(
							lt(viewerLikedViews.likedAt, cursor.viewedAt),
							and(
								eq(viewerLikedViews.likedAt, cursor.viewedAt),
								lt(videos.id, cursor.id),
							)
						)
							: undefined,
					)
				)
				.orderBy(desc(viewerLikedViews.likedAt), desc(videos.id))
				/* Add 1 to the limit to check if there is more data. */
				.limit(limit + 1);

			const hasMore = data.length > limit;
			// Remove the last item if there is more data.
			const items = hasMore ? data.slice(0, -1) : data;
			// Set the next curosr to the last item if there is more data.
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore ? { id: lastItem.id, viewedAt: lastItem.viewedAt } : null;

			return { items, nextCursor };
		}),
});
