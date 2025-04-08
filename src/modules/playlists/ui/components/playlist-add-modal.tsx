import { ResponsiveModal } from '@/components/responsive-dialog';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

interface PlaylistAddModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	videoId: string;
}

export const PlaylistAddModal = ({ open, onOpenChange, videoId }: PlaylistAddModalProps) => {
	const { data } = trpc.playlists.getRelatedPlaylist.useInfiniteQuery(
		{ limit: DEFAULT_LIMIT, videoId },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: !!videoId && open },
	);
	return (
		<ResponsiveModal title='Add to playlist' open={open} onOpenChange={onOpenChange}>
			<div className='flex flex-col gap-2'>{JSON.stringify(data)}</div>
		</ResponsiveModal>
	);
};
