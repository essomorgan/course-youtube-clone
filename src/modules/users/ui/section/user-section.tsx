'use client';

import { trpc } from '@/trpc/client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { UserPageBanner } from '../components/user-page.banner';
import { UserPageContent } from '../components/user-page-content';

interface UserSectionProps {
	userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<UserSectionSuspense userId={userId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
	const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });
	return (
		<div className='flex flex-col'>
			<UserPageBanner user={user} />
			<UserPageContent user={user} />
		</div>
	);
};
