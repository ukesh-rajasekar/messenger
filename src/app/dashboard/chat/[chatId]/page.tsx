import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { messageArrayValidator } from '@/lib/validators/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface ChatProps {
    params: {
        chatId: string
    }
}


async function getMessages(chatId: string) {
    try {


        const response = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, 1) as string[]
        const dbMessages = response.map((message) => JSON.parse(message) as Message)
        const reversedMessages = dbMessages.reverse()
        const messages = messageArrayValidator.parse(reversedMessages)
        return messages
    }
    catch (error) {
        notFound()
    }

}
const Chat: FC<ChatProps> = async ({ params }) => {
    const { chatId } = params
    const session = await getServerSession(authOptions)
    if (!session) return notFound()



    const { user } = session

    const [userId1, userId2] = chatId.split('--')

    //check if the message came from the current user
    if (userId1 !== user.id && userId2 !== user.id) {
        return notFound()
    }

    const partnerId = userId1 === user.id ? userId2 : userId1

    //fetching partner data
    const response = (await fetchRedis('get', `user:${partnerId}`)) as string
    const chatPartner = await JSON.parse(response) as User

    const messages = getMessages(chatId)


    console.log(messages);

    return <div className='flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-6rem)]'>
        <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
            <div className='relative flex items-center space-x-4'>
                <div className='relative'>
                    <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                        <Image
                            fill
                            referrerPolicy='no-referrer'
                            src={chatPartner.image}
                            alt={`${chatPartner.name} profile picture`}
                            className='rounded-full ml-2'
                        /></div></div>
                <div className='flex flex-col leading-tight'>
                    <div className='text-xl flex items-center'>
                        <span className='text-gray-700 mr-3 font-semibold'>{chatPartner.name}</span>
                    </div>
                    <span className='text-gray-600 text-sm'>{chatPartner.email}</span>
                </div>
            </div>
        </div>
    </div>
}

export default Chat