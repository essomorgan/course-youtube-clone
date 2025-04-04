'use client';

import { trpc } from '@/trpc/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { FilterCarousel } from '@/components/filter-carousel';
import { useRouter } from 'next/navigation';

interface CategoriesSectionProps {
	categoryId?: string;
}

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
	const router = useRouter();
	const [categories] = trpc.categories.getMany.useSuspenseQuery();
	const data = categories.map(({ name, id }) => ({
		value: id,
		label: name,
	}));

	const onSelect = (value: string | null) => {
		const url = new URL(window.location.href);

		value ? url.searchParams.set('categoryId', value) : url.searchParams.delete('categoryId');

		router.push(url.toString());
	};

	return <FilterCarousel value={categoryId} data={data} onSelect={onSelect} />;
};

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
	return (
		<Suspense fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}>
			<ErrorBoundary fallback={<p>Error...</p>}>
				<CategoriesSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};
