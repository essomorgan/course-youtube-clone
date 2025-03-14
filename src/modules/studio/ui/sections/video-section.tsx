'use client';

import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';

export const VideosSection = () => {
	//if don't want to prefetch, just use useQuery.
	const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);
	return <div>{JSON.stringify(data)}</div>;
};
