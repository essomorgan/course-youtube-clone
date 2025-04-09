import Link from 'next/link';
import { PlaylistsGetManyOutput } from '../../types';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';
import { PlaylistThumbnail, PlaylistThumbnailskeleton } from './playlist-thumbnail';
import { PlaylistInfo, PlaylistInfoSkeleton } from './playlist-info';

interface PlaylistGridCardProp {
	playlist: PlaylistsGetManyOutput['items'][number];
}

export const PlaylistGridCardSkeleton = () => {
	return (
		<div className='flex flex-col gap-2 w-full'>
			<PlaylistThumbnailskeleton />
			<PlaylistInfoSkeleton />
		</div>
	);
};

export const PlaylistGridCard = ({ playlist }: PlaylistGridCardProp) => {
	return (
		<Link href={`/playlists/${playlist.id}`}>
			<div className='flex flex-col gap-2 w-full group'>
				<PlaylistThumbnail imageUrl={playlist.thumbnailUrl || THUMBNAIL_FALLBACK} title={playlist.name} videoCount={playlist.videoCount} />
				<PlaylistInfo playlist={playlist} />
			</div>
		</Link>
	);
};
