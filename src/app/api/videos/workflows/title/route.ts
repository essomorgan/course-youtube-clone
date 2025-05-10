import { db } from "@/db";
import { videos } from "@/db/local-schema";
import { serve } from "@upstash/workflow/nextjs"
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType;
    const { videoId, userId } = input;

    await context.run('update-video', async () => {
      await db
        .update(videos)
        .set({ title: 'Updated from background job' })
        .where(and(
          eq(videos.id, videoId),
          eq(videos.userId, userId),
        ));
    });
  }
);
