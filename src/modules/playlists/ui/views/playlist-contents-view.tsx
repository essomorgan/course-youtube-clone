import { HistoryVideosSection } from '../sections/history-videos-section';
import { PlaylistHeaderSection } from '../sections/playlist-header-Section';

interface PlaylistContentsViewProps {
	playlistId: string;
}

export const PlaylistContentsView = ({ playlistId }: PlaylistContentsViewProps) => {
	return (
		<div className='max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6'>
			<PlaylistHeaderSection playlistId={playlistId} />
		</div>
	);
};
