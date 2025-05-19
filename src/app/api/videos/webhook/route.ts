import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { VideoAssetCreatedWebhookEvent, VideoAssetDeletedWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

const SIGNING_SECRET = process.env.MUZ_WEBHOOK_SECRET;

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetTrackReadyWebhookEvent
	| VideoAssetDeletedWebhookEvent

export const POST = async (request: Request) => {
	if (!SIGNING_SECRET) throw new Error("MUZ_WEBHOOK_SECRET is not set");

	const headersPayload = await headers();
	const muxSignature = headersPayload.get("mux-signature");
	if (!muxSignature) return new Response("No signature found", { status: 401 });

	const payload = await request.json();
	const body = JSON.stringify(payload);
	mux.webhooks.verifySignature(
		body,
		{ "mux-signature": muxSignature },
		SIGNING_SECRET,
	);

	switch (payload.type as WebhookEvent["type"]) {
		case "video.asset.created": {
			const data = payload.data as VideoAssetCreatedWebhookEvent['data'];
			if (!data.upload_id) return new Response("No upload ID found", { status: 400 });

			await db
				.update(videos)
				.set({ muxAssetId: data.id, muxStatus: data.status })
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.errored": {
			const data = payload.data as VideoAssetErroredWebhookEvent['data'];
			if (!data.upload_id) return new Response("Missing upload ID", { status: 400 });

			await db
				.update(videos)
				.set({ muxStatus: data.status })
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.ready": {
			const data = payload.data as VideoAssetReadyWebhookEvent['data'];
			const playbackId = data.playback_ids?.[0].id;
			if (!data.upload_id) return new Response("Missing upload ID", { status: 400 });
			if (!playbackId) return new Response("Missing playback ID", { status: 400 });

			const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
			const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
			const duration = data.duration ? Math.round(data.duration * 1000) : 0;
			const utApi = new UTApi();
			const [uploadedThumbnail, uploadedPreview] = await utApi.uploadFilesFromUrl([
				tempThumbnailUrl,
				tempPreviewUrl,
			]);
			if (!uploadedThumbnail.data || !uploadedPreview.data) return new Response("Failed to upload thumbnail or preview", { status: 500 });

			await db
				.update(videos)
				.set({
					muxStatus: data.status,
					muxPlaybackId: playbackId,
					muxAssetId: data.id,
					thumbnailUrl: uploadedThumbnail.data.url,
					thumbnailKey: uploadedThumbnail.data.key,
					previewUrl: uploadedPreview.data.url,
					previewKey: uploadedPreview.data.key,
					duration,
				})
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.track.ready": {
			//Ts incorrectly says that asset_id does not exist
			const data = payload.data as VideoAssetReadyWebhookEvent['data'] & { asset_id: string };
			if (!data.asset_id) return new Response("Missing upload ID", { status: 400 });

			await db
				.update(videos)
				.set({
					muxTrackId: data.id,
					muxTrackStatus: data.status
				})
				.where(eq(videos.muxAssetId, data.asset_id));
			break;
		}
		case "video.asset.deleted": {
			const data = payload.data as VideoAssetDeletedWebhookEvent['data'];
			if (!data.upload_id) return new Response("Missing upload ID", { status: 400 });

			await db
				.delete(videos)
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
	}

	return new Response('Webhook received', { status: 200 });
};