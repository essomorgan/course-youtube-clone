import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { MainSection } from './main-section';
import { Separator } from '@/components/ui/separator';
import { UserSection } from './user-section';
import { SignedIn } from '@clerk/nextjs';
import { SubscriptionsSection } from './subscriptions-section';

export const HomeSidebar = () => {
	return (
		<Sidebar className='pt-16 z-40 border-none' collapsible='icon'>
			<SidebarContent className='bg-background'>
				<MainSection />
				<Separator />
				<UserSection />
				<SignedIn>
					<>
						<Separator />
						<SubscriptionsSection />
					</>
				</SignedIn>
			</SidebarContent>
		</Sidebar>
	);
};
