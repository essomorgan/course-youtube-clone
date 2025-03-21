import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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
});