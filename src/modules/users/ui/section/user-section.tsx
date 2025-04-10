'use client';

import { trpc } from '@/trpc/client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { UserPageBanner, UserPageBannerSkeleton } from '../components/user-page.banner';
import { UserPageContent, UserPageContentSkeleton } from '../components/user-page-content';
import { Separator } from '@/components/ui/separator';

interface UserSectionProps {
	userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
	return (
		<Suspense fallback={<UserSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<UserSectionSuspense userId={userId} />
			</ErrorBoundary>
		</Suspense>
	);
};

export const UserSectionSkeleton = () => {
	return (
		<div className='flex flex-col'>
			<UserPageBannerSkeleton />
			<UserPageContentSkeleton />
			<Separator />
		</div>
	);
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
	const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });
	return (
		<div className='flex flex-col'>
			<UserPageBanner user={user} />
			<UserPageContent user={user} />
			<Separator />
		</div>
	);
};
