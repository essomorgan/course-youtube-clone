import { useMemo } from 'react';
import { VideoGetOneOutput } from '../../typs';
import { VideoDescription } from './video-description';
import { VideoMenu } from './video-menu';
import { VideoOwner } from './video-owner';
import { VideoReactions } from './video-reactions';
import { formatDistanceToNow, format } from 'date-fns';

interface VideoTopRowProps {
	video: VideoGetOneOutput;
}

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
	const compactViews = useMemo(() => {
		return Intl.NumberFormat('en', { notation: 'compact' }).format(1342);
	}, []);
	const extandedViews = useMemo(() => {
		return Intl.NumberFormat('en', { notation: 'standard' }).format(1342);
	}, []);
	const compactDate = useMemo(() => {
		return formatDistanceToNow(video.createAt, { addSuffix: true });
	}, []);
	const expandedDate = useMemo(() => {
		return format(video.createAt, 'yyyy/mm/dd');
	}, []);

	return (
		<div className='flex flex-col gap-4 mt-4'>
			<h1 className='text-xl font-semibold'>{video.title}</h1>
			<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
				<VideoOwner user={video.user} videoId={video.id} />
				<div className='flex overflow-x-auto sm:min-w-[clac(50%-6px)] sm:justify-end sm:overflow-visible pb-2 sm:pb-0 sm:mb-0 gap-2'>
					<VideoReactions />
					<VideoMenu videoId={video.id} variant='secondary' />
				</div>
			</div>
			<VideoDescription
				compactViews={compactViews}
				expandedViews={extandedViews}
				compactDate={compactDate}
				expandedDate={expandedDate}
				description={video.description}
			/>
		</div>
	);
};
