'use client';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { ClapperboardIcon, UserCircleIcon, UserIcon } from 'lucide-react';

export const AuthButton = () => {
	//TBD: add different auth states
	return (
		<>
			<SignedIn>
				<UserButton>
					<UserButton.MenuItems>
						<UserButton.Link label='My profile' href='/users/current' labelIcon={<UserIcon className='size-4' />} />
						<UserButton.Link label='Studio' href='/studio' labelIcon={<ClapperboardIcon className='size-4' />} />
					</UserButton.MenuItems>
				</UserButton>
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
