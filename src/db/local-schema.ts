import { uuidv7 } from "uuidv7";
import { relations, sql } from "drizzle-orm";
import { foreignKey, integer, sqliteTable, primaryKey, text, uniqueIndex, customType } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';

const textEnum = <V extends Record<string, string>, RV = V[keyof V]>(
	columnName: string,
	enumObj: V,
	message?: string,
) => {
	const colFn = customType<{
		data: string;
		driverData: string;
	}>({
		dataType() {
			return "text";
		},
		toDriver(value: string): string {
			const values = Object.values(enumObj);
			if (!values.includes(value))
				throw Error(
					message ??
					`Invalid value for column ${columnName}. Expected:${values.join(
						",",
					)} | Found:${value}`,
				);
			return value;
		},
	});
	return colFn(columnName).$type<RV>();
};

export const users = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(() => uuidv7()),
	clerkId: text('clerk_id').unique().notNull(),
	name: text('name').notNull(),
	bannerUrl: text('banner_url'),
	bannerKey: text('banner_key'),
	imageUrl: text('image_url').notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [uniqueIndex('clerk_id_idx').on(t.clerkId)]);

export const userRelations = relations(users, ({ many }) => ({
	videos: many(videos),
	videoViews: many(videoViews),
	videoReactions: many(videoReactions),
	subscriptions: many(subscriptions, { relationName: 'subscriptions_viewer_id_fkey' }),
	subscribers: many(subscriptions, { relationName: 'subscriptions_creator_id_fkey' }),
	comments: many(comments),
	commentReactions: many(commentReactions),
	playlists: many(playlists),
}));

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey().$defaultFn(() => uuidv7()),
	name: text('name').notNull(),
	description: text('description'),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [uniqueIndex('name_idx').on(t.name)]);

export const categoryRelations = relations(categories, ({ many }) => ({
	videos: many(videos),
}));

export const videos = sqliteTable('videos', {
	id: text('id').primaryKey().$defaultFn(() => uuidv7()),
	title: text('title').notNull(),
	description: text('description'),
	muxStatus: text('mux_status'),
	muxAssetId: text('mux_asset_id').unique(),
	muxUploadId: text('mux_upload_id').unique(),
	muxPlaybackId: text('mux_playback_id').unique(),
	muxTrackId: text('mux_track_id').unique(),
	muxTrackStatus: text('mux_track_status'),
	thumbnailUrl: text('thumbnail_url'),
	thumbnailKey: text('thumbnail_key'),
	previewUrl: text('preview_url'),
	previewKey: text('preview_key'),
	duration: integer('duration').default(0).notNull(),
	visibility: text('visibility').default('private').notNull(),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
});

export const videoUpdateSchema = createUpdateSchema(videos);

export const videoRelations = relations(videos, ({ one, many }) => ({
	user: one(users, {
		fields: [videos.userId],
		references: [users.id],
		relationName: 'video_user',
	}),
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id],
	}),
	views: many(videoViews),
	reactions: many(videoReactions),
	comments: many(comments),
	playlistVideos: many(playlistVideos),
}));

export const videoViews = sqliteTable('video_views', {
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	videoId: text('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [primaryKey({
	name: 'video_views_pk',
	columns: [t.userId, t.videoId],
})]);

export const videoViewRelations = relations(videoViews, ({ one }) => ({
	users: one(users, {
		fields: [videoViews.userId],
		references: [users.id],
	}),
	videos: one(videos, {
		fields: [videoViews.videoId],
		references: [videos.id],
	}),
}));

export const reactionType = {
	like: 'like',
	dislike: 'dislike'
} as const;

export const videoReactions = sqliteTable('video_reactions', {
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	videoId: text('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
	type: textEnum('type', reactionType).notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [primaryKey({
	name: 'video_reactions_pk',
	columns: [t.userId, t.videoId],
})]);

export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
	users: one(users, {
		fields: [videoReactions.userId],
		references: [users.id],
	}),
	videos: one(videos, {
		fields: [videoReactions.videoId],
		references: [videos.id],
	}),
}));

export const subscriptions = sqliteTable('subscriptions', {
	viewerId: text('viewer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	creatorId: text('creator_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [primaryKey({
	name: 'subscriptions_pk',
	columns: [t.viewerId, t.creatorId],
})]);

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
	viewer: one(users, {
		fields: [subscriptions.viewerId],
		references: [users.id],
		relationName: 'subscriptions_viewer_id_fkey',
	}),
	creator: one(users, {
		fields: [subscriptions.creatorId],
		references: [users.id],
		relationName: 'subscriptions_creator_id_fkey',
	}),
}));

export const comments = sqliteTable('comments', {
	id: text('id').primaryKey().$defaultFn(() => uuidv7()),
	parentId: text('parent_id'),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	videoId: text('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
	value: text('value').notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => {
	return [
		foreignKey({
			columns: [t.parentId],
			foreignColumns: [t.id],
			name: 'comments_parent_id_fkey',
		})
			.onDelete('cascade'),
	];
});

export const commentRelations = relations(comments, ({ one, many }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
	video: one(videos, {
		fields: [comments.videoId],
		references: [videos.id],
	}),
	reactions: many(commentReactions),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: 'comments_parent_id_fkey',
	}),
	replies: many(comments, {
		relationName: 'comments_parent_id_fkey',
	}),
}));

export const commentInsertSchema = createInsertSchema(comments);

export const commentReactions = sqliteTable('comment_reactions', {
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	commentId: text('comment_id').references(() => comments.id, { onDelete: 'cascade' }).notNull(),
	type: textEnum('type', reactionType).notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [primaryKey({
	name: 'comment_reactions_pk',
	columns: [t.userId, t.commentId],
})]);

export const commentReactionRelations = relations(commentReactions, ({ one }) => ({
	users: one(users, {
		fields: [commentReactions.userId],
		references: [users.id],
	}),
	comments: one(comments, {
		fields: [commentReactions.commentId],
		references: [comments.id],
	}),
}));

export const playlists = sqliteTable('playlists', {
	id: text('id').primaryKey().$defaultFn(() => uuidv7()),
	name: text('name').notNull(),
	descriptions: text('description'),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
});

export const playlistRelations = relations(playlists, ({ one, many }) => ({
	users: one(users, {
		fields: [playlists.userId],
		references: [users.id],
	}),
	playlistVideos: many(playlistVideos),
}));

export const playlistVideos = sqliteTable('playlist_videos', {
	playlistId: text('playlist_id').references(() => playlists.id, { onDelete: 'cascade' }).notNull(),
	videoId: text('video_id').references(() => videos.id, { onDelete: 'cascade' }).notNull(),
	createAt: integer('created_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`).notNull(),
}, (t) => [primaryKey({
	name: 'playlist_videos_pk',
	columns: [t.playlistId, t.videoId],
})]);

export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
	playlist: one(playlists, {
		fields: [playlistVideos.playlistId],
		references: [playlists.id],
	}),
	video: one(videos, {
		fields: [playlistVideos.videoId],
		references: [videos.id],
	}),
}));