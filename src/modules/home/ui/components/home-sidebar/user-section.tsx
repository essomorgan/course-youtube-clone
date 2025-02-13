'use client';

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from 'lucide-react';
import Link from 'next/link';

const items = [
	{
		title: 'History',
		url: '/playlists/history',
		icom: HistoryIcon,
		auth: true,
	},
	{
		title: 'Liked Videos',
		url: '/playlists/liked',
		icom: ThumbsUpIcon,
		auth: true,
	},
	{
		title: 'All playlists',
		url: '/playlists',
		icom: ListVideoIcon,
		auth: true,
	},
];

export const UserSection = () => {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>You</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
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
