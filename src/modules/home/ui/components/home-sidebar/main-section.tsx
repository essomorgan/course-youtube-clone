'use client';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
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
	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
              {/* TBD: Change to look at current pathname & set click event */}
							<SidebarMenuButton tooltip={item.title} asChild isActive={false} onClick={() => {}}>
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
