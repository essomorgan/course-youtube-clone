import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface UseSubscriptionProps {
	userId: string;
	isSubscribed: boolean;
	fromVideoId?: string;
}

export const useSubscription = ({ userId, isSubscribed, fromVideoId }: UseSubscriptionProps) => {
	const clerk = useClerk();
	const utils = trpc.useUtils();
	const subscribe = trpc.subscriptions.create.useMutation({
		onSuccess: () => {
			toast.success('Subscribed')
			utils.videos.getSubscriptions.invalidate();
			utils.users.getOne.invalidate({ id: userId });
			utils.subscriptions.getMany.invalidate();
			if (fromVideoId) utils.videos.getOne.invalidate({ id: fromVideoId });
		},
		onError: (error) => {
			toast.error('Something went wrong');
			if (error.data?.code === 'UNAUTHORIZED') clerk.openSignIn();
		},
	});
	const unSubscribe = trpc.subscriptions.remove.useMutation({
		onSuccess: () => {
			toast.success('Unsubscribed')
			utils.videos.getSubscriptions.invalidate();
			utils.users.getOne.invalidate({ id: userId });
			utils.subscriptions.getMany.invalidate();
			if (fromVideoId) utils.videos.getOne.invalidate({ id: fromVideoId });
		},
		onError: (error) => {
			toast.error('Something went wrong');
			if (error.data?.code === 'UNAUTHORIZED') clerk.openSignIn();
		},
	});
	const isPending = subscribe.isPending || unSubscribe.isPending;
	const onClick = () => {
		isSubscribed ? unSubscribe.mutate({ userId }) : subscribe.mutate({ userId });
	};

	return { isPending, onClick };
};
