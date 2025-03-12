'use client';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuth, useClerk } from '@clerk/nextjs';
import { FlameIcon, HomeIcon, PlaySquareIcon } from 'lucide-react';
import Link from 'next/link';

const items = [
	{
		title: 'Home',
		url: '/',
		icom: HomeIcon,
	},
	{
		title: 'Subscriptions',
		url: '/feed/subscrptions',
		icom: PlaySquareIcon,
		auth: true,
	},
	{
		title: 'Trending',
		url: '/feed/trending',
		icom: FlameIcon,
	},
];

export const MainSection = () => {
	const clerk = useClerk();
	const { isSignedIn } = useAuth();

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							{/* TBD: Change to look at current pathname */}
							<SidebarMenuButton
								tooltip={item.title}
								asChild
								isActive={false}
								onClick={(e) => {
									if (!isSignedIn && item.auth) {
										e.preventDefault();
										return clerk.openSignIn();
									}
								}}
							>
								<Link href={item.url} className='flex items-center gap-4'>
									<item.icom />
									<span className='text-sm'>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
