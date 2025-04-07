import Link from 'next/link';
import { PlaylistsGetManyOutput } from '../../types';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';
import { PlaylistThumbnail } from './playlist-thumbnail';

interface PlaylistGridCardProp {
	playlist: PlaylistsGetManyOutput['items'][number];
}

export const PlaylistGridCard = ({ playlist }: PlaylistGridCardProp) => {
	return (
		<Link href={`/playlists/${playlist.id}`}>
			<div className='flex flex-col gap-2 w-full group'>
				<PlaylistThumbnail imageUrl={THUMBNAIL_FALLBACK} title={playlist.name} videoCount={playlist.videoCount} />
			</div>
		</Link>
	);
};
