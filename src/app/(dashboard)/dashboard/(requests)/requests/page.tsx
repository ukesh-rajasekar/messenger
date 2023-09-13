import FriendRequests from '@/components/FriendRequests';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation';
import { FC } from 'react'

interface RequestsProps {

}

const Requests: FC<RequestsProps> = async ({ }) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound()


  //ids of people who sent us friend requests
  const incomingRequestIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[]
  console.log(incomingRequestIds, 'requests here')

  const incomingRequestDetails = await Promise.all(
    incomingRequestIds.map(async (id)=> {
      const sender = (await fetchRedis('get', `user:${id}`)) as string
      const result = JSON.parse(sender) as User
      return {
        senderId: id,
        senderEmail: result.email
      }
    })
  )

  console.log(incomingRequestDetails, 'here')
  return (<main className='pt-8 ml-2'>
  <h1 className='font-bold text-5xl mb-8'>Friend requests</h1>
  <div className='flex flex-col gap-4'>
    <FriendRequests incomingRequests={incomingRequestDetails} sessionId={session.user.id}/>
  </div>
</main>)
}

export default Requests