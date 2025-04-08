import { InfiniteScroll } from '@/components/infinite-scroll';
import { ResponsiveModal } from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';
import { Loader2Icon, SquareCheckIcon, SquareIcon } from 'lucide-react';

interface PlaylistAddModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	videoId: string;
}

export const PlaylistAddModal = ({ open, onOpenChange, videoId }: PlaylistAddModalProps) => {
	const {
		data: playlists,
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = trpc.playlists.getRelatedPlaylist.useInfiniteQuery(
		{ limit: DEFAULT_LIMIT, videoId },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: !!videoId && open },
	);
	const utils = trpc.useUtils();
	const handleOpenChange = (newOpen: boolean) => {
		utils.playlists.getRelatedPlaylist.reset();
		onOpenChange(newOpen);
	};

	return (
		<ResponsiveModal title='Add to playlist' open={open} onOpenChange={onOpenChange}>
			<div className='flex flex-col gap-2'>
				{isLoading && (
					<div className='flex justify-center p-4'>
						<Loader2Icon className='size-5 animate-spin text-muted-foreground' />
					</div>
				)}
				{!isLoading &&
					playlists?.pages
						.flatMap((page) => page.items)
						.map((playlist) => (
							<Button key={playlist.id} variant='ghost' className='w-full justify-start px-2 [&_svg]:size-5' size='lg'>
								{playlist.containsVideo ? <SquareCheckIcon className='mr-2' /> : <SquareIcon className='mr-2' />}
								{playlist.name}
							</Button>
						))}
				{!isLoading && <InfiniteScroll hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} isManual />}
			</div>
		</ResponsiveModal>
	);
};
