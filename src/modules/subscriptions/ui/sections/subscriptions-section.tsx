'use client';

import { InfiniteScroll } from '@/components/infinite-scroll';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';
import { SubscriptionItem, SubscriptionItemSkeleton } from '../components/subscription-item';

export const SubscriptionsSection = () => {
	return (
		<Suspense fallback={<SubscriptionsSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<SubscriptionsSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const SubscriptionsSectionSkeleton = () => {
	return (
		<div className='flex flex-col gap-4 gap-y-10'>
			{Array.from({ length: 5 }).map((_, index) => (
				<SubscriptionItemSkeleton key={index} />
			))}
		</div>
	);
};

export const SubscriptionsSectionSuspense = () => {
	const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);
	const utils = trpc.useUtils();
	const subscribe = trpc.subscriptions.create.useMutation({
		onSuccess: (data) => {
			toast.success('Subscribed');
			utils.videos.getSubscriptions.invalidate();
			utils.users.getOne.invalidate({ id: data.creatorId });
			utils.subscriptions.getMany.invalidate();
		},
		onError: () => toast.error('Something went wrong'),
	});
	const unSubscribe = trpc.subscriptions.remove.useMutation({
		onSuccess: (data) => {
			toast.success('Unsubscribed');
			utils.videos.getSubscriptions.invalidate();
			utils.users.getOne.invalidate({ id: data.creatorId });
			utils.subscriptions.getMany.invalidate();
		},
		onError: () => toast.error('Something went wrong'),
	});

	return (
		<div>
			<div className='flex flex-col gap-4 gap-y-10 '>
				{subscriptions.pages
					.flatMap((page) => page.items)
					.map((subscription) => (
						<Link prefetch key={subscription.creatorId} href={`/users/${subscription.user.id}`}>
							<SubscriptionItem
								name={subscription.user.name}
								imageUrl={subscription.user.imageUrl}
								subscriberCount={subscription.user.subscriberCount}
								onUnsubscribe={() => {
									unSubscribe.mutate({ userId: subscription.user.id });
								}}
								disabled={unSubscribe.isPending}
							/>
						</Link>
					))}
			</div>
			<InfiniteScroll hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} fetchNextPage={query.fetchNextPage} />
		</div>
	);
};
