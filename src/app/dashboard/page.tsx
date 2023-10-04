import { getFriendsData } from '@/helpers/fetchFriends';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { chatLinkConstructor } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
const page = async ({}) => {
   const session = await getServerSession(authOptions);
   console.log(session, 'page session');

   if (!session) {
      notFound();
   }

   //fetch and display friends
   const friendsData = await getFriendsData(session.user.id);

   //fetch last message
   const friendsWithLastMessage = await Promise.all(
      friendsData.map(async (friend) => {
         let [lastMessage] = await fetchRedis(
            'zrange',
            `chat:${chatLinkConstructor(session.user.id, friend.id)}:messages`,
            -1,
            -1
         );
         lastMessage = JSON.parse(lastMessage) as Message[];
         return {
            ...friend,
            lastMessage,
         };
      })
   );

   return (
      <div className='container py-12'>
         <h1 className='font-bold text-5xl text-black mb-8'>Recent chats</h1>
         {friendsWithLastMessage.length === 0 ? (
            <p className='text-sm text-zinc-500'>Nothing to show here...</p>
         ) : (
            friendsWithLastMessage.map((friend) => (
               <div
                  key={friend.id}
                  className='relative bg-zinc-500 border border-zinc-200 p-3 rounded-md'>
                  <div className='absolute right-4 inset-y-0 flex items-center'>
                     <ChevronRight className='h-7 w-7 text-zinc-400' />
                  </div>

                  <Link
                     href={`/dashboard/chat/${chatLinkConstructor(
                        session.user.id,
                        friend.id
                     )}`}
                     className='relative sm:flex'>
                     <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                        <div className='relative h-7 w-7'>
                           <Image
                              referrerPolicy='no-referrer'
                              className='rounded-full'
                              alt={`${friend.name} profile picture`}
                              src={friend.image}
                              fill
                           />
                        </div>
                     </div>

                     <div>
                        <h4 className='text-lg font-semibold'>{friend.name}</h4>
                        <p className='mt-1 max-w-md'>
                           <span className='text-zinc-400'>
                              {friend.lastMessage.senderId === session.user.id
                                 ? 'You: '
                                 : ''}
                           </span>
                           {friend.lastMessage.text}
                        </p>
                     </div>
                  </Link>
               </div>
            ))
         )}
      </div>
   );
};

export default page;
