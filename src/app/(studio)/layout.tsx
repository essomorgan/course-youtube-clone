import { StudioLayout } from '@/modules/studio/ui/layouts/studio-layout';

interface LayoutProps {
	children: React.ReactNode;
}

/* TBD: comfirm this is needed or not */
export const dynamic = 'force-dynamic';

const Layout = ({ children }: LayoutProps) => {
	return <StudioLayout>{children}</StudioLayout>;
};

export default Layout;
