'use client';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignIn, SignInButton, UserButton } from '@clerk/nextjs';
import { UserCircleIcon } from 'lucide-react';

export const AuthButton = () => {
	//TBD: add different auth states
	return (
		<>
			<SignedIn>
				<UserButton />
        {/* TBD: Add menu item for Studio and User profile */}
			</SignedIn>
			<SignedOut>
				<SignInButton mode='modal'>
					<Button
						variant='outline'
						className='px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/2 rounded-full shadow-none [&_svg]:size-4'
					>
						<UserCircleIcon />
						Sign In
					</Button>
				</SignInButton>
			</SignedOut>
		</>
	);
};
