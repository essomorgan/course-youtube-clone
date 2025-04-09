import { DEFAULT_LIMIT } from '@/constants';
import { PlaylistContentsView } from '@/modules/playlists/ui/views/playlist-contents-view';
import { HydrateClient, trpc } from '@/trpc/server';

interface PageProps {
	params: Promise<{ playlistId: string }>;
}

export const dynamic = 'force-dynamic';

const Page = async ({ params }: PageProps) => {
	const { playlistId } = await params;
	void trpc.playlists.getRelatedVideos.prefetchInfinite({ limit: DEFAULT_LIMIT, playlistId });

	return (
		<HydrateClient>
			<PlaylistContentsView playlistId={playlistId} />
		</HydrateClient>
	);
};

export default Page;
