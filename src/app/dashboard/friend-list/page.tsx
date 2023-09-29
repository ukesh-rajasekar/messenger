import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface FriendListProps {}

const FriendList: FC<FriendListProps> = async ({}) => {
   const session = await getServerSession(authOptions);
   if (!session) return notFound();

   const friendIds = await fetchRedis(
      'smembers',
      `user:${session.user.id}:friends`
   );

   //fetch and display friends
   const friendsData = await Promise.all(
      friendIds.map(async (id) => {
         const response = (await fetchRedis('get', `user:${id}`)) as string;
         const result = (await JSON.parse(response)) as User;
         return {
            friendId: result.id,
            friendEmail: result.email,
            friendName: result.name,
         };
      })
   );

   return <div>FriendList</div>;
};

export default FriendList;
