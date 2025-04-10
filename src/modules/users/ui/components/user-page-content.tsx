import { UserAvatar } from '@/components/user-avatar';
import { UserGetOneOutput } from '../../type';
import { useClerk, useAuth } from '@clerk/nextjs';
import {} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubscriptionButton } from '@/modules/subscriptions/ui/components/subscription-button';
import { useSubscription } from '@/modules/subscriptions/hooks/use-subscriptions';
import { cn } from '@/lib/utils';

interface UserPageContentProps {
	user: UserGetOneOutput;
}

export const UserPageContent = ({ user }: UserPageContentProps) => {
	const { userId, isLoaded } = useAuth();
	const clerk = useClerk();
	const { isPending, onClick } = useSubscription({
		userId: user.id,
		isSubscribed: user.subscribed,
	});

	return (
		<div className='py-6'>
			{/* Mobile layout */}
			<div className='flex flex-col md:hidden'>
				<div className='flex items-center gap-3'>
					<UserAvatar
						size='lg'
						imageUrl={user.imageUrl}
						name={user.name}
						className='h-[60px] w-[60px]'
						onCLick={() => {
							if (user.clerkId === userId) clerk.openUserProfile();
						}}
					/>
					<div className='flex-1 min-w-0'>
						<h1 className='text-xl font-bold'>{user.name}</h1>
						<div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'>
							<span>{user.subscriberCount} subscribers</span>
							<span>&bull;</span>
							<span>{user.videoCount} videos</span>
						</div>
					</div>
				</div>
				{userId === user.clerkId ? (
					<Button variant='secondary' asChild className='w-full mt-3 rounded-full'>
						<Link href='/studio'>Go to Studio</Link>
					</Button>
				) : (
					<SubscriptionButton disabled={isPending || !isLoaded} isSubscribed={user.subscribed} onClick={onClick} className='w-full mt-3' />
				)}
			</div>
			{/* Desktop layout */}
			<div className='hidden md:flex items-start gap-4'>
				<UserAvatar
					size='xl'
					imageUrl={user.imageUrl}
					name={user.name}
					className={cn(userId === user.clerkId && 'cursor-pointer hover:opacity-80 transition-opacity duration-300')}
					onCLick={() => {
						if (user.clerkId === userId) clerk.openUserProfile();
					}}
				/>
				<div className='flex-1 min-w-0'>
					<h1 className='text-4xl font-bold'>{user.name}</h1>
					<div className='flex items-center gap-1 text-sm text-muted-foreground mt-3'>
						<span>{user.subscriberCount} subscribers</span>
						<span>&bull;</span>
						<span>{user.videoCount} videos</span>
					</div>
					{userId === user.clerkId ? (
						<Button variant='secondary' asChild className='mt-3 rounded-full'>
							<Link href='/studio'>Go to Studio</Link>
						</Button>
					) : (
						<SubscriptionButton disabled={isPending || !isLoaded} isSubscribed={user.subscribed} onClick={onClick} className='mt-3' />
					)}
				</div>
			</div>
		</div>
	);
};
