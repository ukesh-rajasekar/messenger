import { Icons } from '@/assets/icons';
import FriendRequestSideBarOption from '@/components/FriendRequestSideBarOption';
import MobileChatLayout from '@/components/MobileChatLayout';
import SideBarChatList from '@/components/SideBarChatList';
import SignOutButton from '@/components/SignOutButton';
import { getFriendsData } from '@/helpers/fetchFriends';
import { fetchRedis } from '@/helpers/redis';
import { SidebarOption } from '@/interfaces/typings';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import ThoodhanIcon from '@/assets/thoodhan';

const sidebarOptions: SidebarOption[] = [
   {
      id: 1,
      name: 'Add friend',
      href: '/dashboard/add',
      Icon: 'UserPlus',
   },
];

interface LayoutProps {
   children: ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
   const session = await getServerSession(authOptions);
   console.log(session, 'layout session');
   if (!session) notFound();

   const friendsData: User[] = await getFriendsData(session.user.id);

   const unseenRequestsCount = (
      (await fetchRedis(
         'smembers',
         `user:${session.user.id}:incoming_friend_requests`
      )) as User[]
   ).length;
   return (
      <div className='w-full h-screen flex'>
         <div className='md:hidden'>
            <MobileChatLayout
               friends={friendsData}
               session={session}
               sidebarOptions={sidebarOptions}
               unseenRequestCount={unseenRequestsCount}
            />
         </div>
         <div className='hidden md:flex h-full w-full max-w-xs flex-col grow gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6'>
            <Link
               href='/dashboard'
               className='h-16 flex shrink-0 items-center'>
               <ThoodhanIcon className='h-8 w-auto text-indigo-600' />
            </Link>
            <div className='text-xs font-semibold leading-6 text-gray-400'>
               Your chats
            </div>
            <nav className='flex flex-1 flex-col'>
               <ul
                  role='list'
                  className='flex flex-1 flex-col gap-y-7'>
                  <SideBarChatList
                     friends={friendsData}
                     sessionId={session.user.id}
                  />
                  <li>
                     <div className='text-xs font-semibold leading-6 text-gray-400'>
                        Overview
                     </div>
                     <ul
                        role='list'
                        className='-mx-2 mt-2 space-y-1'>
                        {sidebarOptions.map((option) => {
                           const Icon = Icons[option.Icon];
                           return (
                              <li key={option.id}>
                                 <Link
                                    href={option.href}
                                    className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                    <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
                                       <Icon className='h-4 w-4' />
                                    </span>

                                    <span className='truncate'>
                                       {option.name}
                                    </span>
                                 </Link>
                              </li>
                           );
                        })}

                        <li>
                           <FriendRequestSideBarOption
                              sessionId={session.user.id}
                              initialUnseenRequestCount={unseenRequestsCount}
                           />
                        </li>
                     </ul>
                  </li>
                  <li className='-mx-6 mt-auto flex items-center'>
                     <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                        <div className='relative h-8 w-8 bg-gray-50'>
                           <Image
                              fill
                              referrerPolicy='no-referrer'
                              className='rounded-full'
                              src={session.user.image || ''}
                              alt='Your profile picture'
                           />
                        </div>

                        <span className='sr-only'>Your profile</span>
                        <div className='flex flex-col'>
                           <span aria-hidden='true'>{session.user.name}</span>
                           <span
                              className='text-xs text-zinc-400'
                              aria-hidden='true'>
                              {session.user.email}
                           </span>
                        </div>
                     </div>

                     <SignOutButton className='h-full aspect-square' />
                  </li>
               </ul>
            </nav>
         </div>
         <aside className='max-h-screen container py-8 md:py-10 w-full'>
            {children}
         </aside>
      </div>
   );
};

export default Layout;
