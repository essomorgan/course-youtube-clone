import { DEFAULT_LIMIT } from '@/constants';
import { StudioView } from '@/modules/studio/ui/view/studio-view';
import { trpc } from '@/trpc/server';

const Page = async () => {
	void trpc.studio.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });

	return (
		<div>
			<StudioView />
		</div>
	);
};

export default Page;
