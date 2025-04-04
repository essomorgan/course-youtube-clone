import { db } from "@/db";
import { subscriptions, users, videoReactions, videos, videoUpdateSchema, videoViews } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { id: userId } = ctx.user;
		const upload = await mux.video.uploads.create({
			new_asset_settings: {
				passthrough: userId,
				playback_policy: ['public'],
				input: [
					{
						generated_subtitles: [
							{ language_code: 'en', name: 'English' },
						],
					},
				],
			},
			cors_origin: '*', //Note: set self url in production.
		});

		const [video] = await db
			.insert(videos)
			.values({
				userId,
				title: 'Untitled',
				muxStatus: 'waiting',
				muxUploadId: upload.id,
			})
			.returning();

		return { video, url: upload.url };
	}),
	update: protectedProcedure
		.input(videoUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			if (!input.id) throw new TRPCError({ code: "BAD_REQUEST" });

			const [updateVideo] = await db
				.update(videos)
				.set({
					title: input.title,
					description: input.description,
					categoryId: input.categoryId,
					visibility: input.visibility,
					updatedAt: new Date(),
				})
				.where(and(
					eq(videos.id, input.id),
					eq(videos.userId, userId),
				))
				.returning();

			if (!updateVideo) throw new TRPCError({ code: "NOT_FOUND" });

			return updateVideo;
		}),
	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const [removedVideo] = await db
				.delete(videos)
				.where(and(
					eq(videos.id, input.id),
					eq(videos.userId, userId)
				))
				.returning();

			if (!removedVideo) throw new TRPCError({ code: 'NOT_FOUND' });

			return removedVideo;
		}),
	restoreThumbnail: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const [existVideo] = await db
				.select()
				.from(videos)
				.where(and(
					eq(videos.id, input.id),
					eq(videos.userId, userId)
				))
			if (!existVideo) throw new TRPCError({ code: 'NOT_FOUND' });
			if (existVideo.thumbnailKey) {
				const utApi = new UTApi();
				await utApi.deleteFiles(existVideo.thumbnailKey);
				await db
					.update(videos)
					.set({
						thumbnailKey: null,
						thumbnailUrl: null,
					})
					.where(and(
						eq(videos.id, input.id),
						eq(videos.userId, userId),
					));
			}
			if (!existVideo.muxPlaybackId) throw new TRPCError({ code: 'BAD_REQUEST' });

			const tempThumbnailUrl = `https://image.mux.com/${existVideo.muxPlaybackId}/thumbnail.jpg`;
			const utApi = new UTApi();
			const uploadedThumbnail = await utApi.uploadFilesFromUrl(tempThumbnailUrl);
			if (!uploadedThumbnail.data) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

			const [updateVideo] = await db
				.update(videos)
				.set({
					thumbnailUrl: uploadedThumbnail.data.url,
					thumbnailKey: uploadedThumbnail.data.key,
				})
				.where(and(
					eq(videos.id, input.id),
					eq(videos.userId, userId),
				))
				.returning();

			if (!updateVideo) throw new TRPCError({ code: "NOT_FOUND" });

			return updateVideo;
		}),
	generateThumbnail: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { workflowRunId } = await workflow.trigger({
				url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
				body: { userId, videoId: input.id },
			});

			return workflowRunId;
		}),
	getOne: baseProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			const { clerkUserId } = ctx;
			let userId;
			const [user] = await db
				.select()
				.from(users)
				.where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
			if (user) userId = user.id;

			const viewerReactions = db.$with('viewer_reactions').as(
				db
					.select({
						videoId: videoReactions.videoId,
						type: videoReactions.type,
					})
					.from(videoReactions)
					.where(inArray(videoReactions.userId, userId ? [userId] : []))
			);
			const viewerSubscriptions = db.$with('viewer_subscipritons').as(
				db
					.select()
					.from(subscriptions)
					.where(inArray(subscriptions.viewerId, userId ? [userId] : []))
			);

			const [existVideo] = await db
				.with(viewerReactions, viewerSubscriptions)
				.select({
					...getTableColumns(videos),
					user: {
						...getTableColumns(users),
						subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
						viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
					},
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
					likeCount: db.$count(videoReactions, and(
						eq(videoReactions.videoId, videos.id),
						eq(videoReactions.type, 'like'),
					)),
					dislikeCount: db.$count(videoReactions, and(
						eq(videoReactions.videoId, videos.id),
						eq(videoReactions.type, 'dislike'),
					)),
					reaction: viewerReactions.type,
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
				.leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
				.where(eq(videos.id, input.id));

			if (!existVideo) throw new TRPCError({ code: "NOT_FOUND" });

			return existVideo;
		}),
	revalidate: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const [existVideo] = await db
				.select()
				.from(videos)
				.where(and(
					eq(videos.id, input.id),
					eq(videos.userId, userId)
				))
			if (!existVideo || !existVideo.muxUploadId) throw new TRPCError({ code: 'NOT_FOUND' });

			const upload = await mux.video.uploads.retrieve(existVideo.muxUploadId);
			if (!upload || !upload.asset_id) throw new TRPCError({ code: 'NOT_FOUND' });

			const asset = await mux.video.assets.retrieve(upload.asset_id);
			if (!asset) throw new TRPCError({ code: 'NOT_FOUND' });

			const playbackId = asset.playback_ids?.[0].id;
			const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

			/* TBD: Potentially find a waay to revalidate trackId and trackStatus as well */

			const [updateVideo] = await db
				.update(videos)
				.set({
					muxStatus: asset.status,
					muxPlaybackId: playbackId,
					muxAssetId: asset.id,
					duration,
				})
				.where(and(
					eq(videos.id, input.id),
					eq(videos.userId, userId),
				))
				.returning();

			return updateVideo;
		}),
});
