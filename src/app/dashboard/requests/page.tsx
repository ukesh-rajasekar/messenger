import FriendRequests from '@/components/FriendRequests';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface RequestsProps {}

const Requests: FC<RequestsProps> = async ({}) => {
   const session = await getServerSession(authOptions);
   if (!session) notFound();

   //ids of people who sent us friend requests
   const incomingRequestIds = (await fetchRedis(
      'smembers',
      `user:${session.user.id}:incoming_friend_requests`
   )) as string[];

   const incomingRequestDetails = await Promise.all(
      incomingRequestIds.map(async (id) => {
         const sender = (await fetchRedis('get', `user:${id}`)) as string;
         const result = JSON.parse(sender) as User;
         return {
            senderId: id,
            senderEmail: result.email,
         };
      })
   );

   return (
      <main className='pt-8 max-sm:mt-6 max-md:mt-3'>
         <h1 className='font-bold text-black text-5xl mb-8'>Friend requests</h1>
         <div className='flex flex-col gap-4'>
            <FriendRequests
               incomingRequests={incomingRequestDetails}
               sessionId={session.user.id}
            />
         </div>
      </main>
   );
};

export default Requests;
