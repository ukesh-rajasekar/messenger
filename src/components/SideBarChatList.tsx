'use client'
import { pusherClient } from '@/lib/pusher'
import { chatLinkConstructor, toKeyPusher } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import NewChatsToast from './NewChatsToast'

interface SideBarChatListProps {
    friends: User[],
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderImage: string;
    senderName: string;
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, sessionId }) => {
    const router = useRouter()
    const pathName = usePathname()


    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    useEffect(() => {
        if (pathName?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev?.filter((message) => !pathName.includes(message.senderId))
            })
        }
    }, [pathName])

    useEffect(() => {
        pusherClient.subscribe(toKeyPusher(`user:${sessionId}:chats`))
        pusherClient.subscribe(toKeyPusher(`user:${sessionId}:friends`))

        const newMessageHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathName != `/dashboard/chat/${chatLinkConstructor(sessionId, message.senderId)}`
            console.log(shouldNotify, '@@@')
            if (!shouldNotify) return
            toast.custom((t) => (
                <NewChatsToast t={t} senderId={message.senderId} senderName={message.senderName}
                    sessionId={sessionId}
                    senderImg={message.senderImage} senderMessage={message.text} />
            ))
            setUnseenMessages((prev) => [...prev, message])
        }
        const newFriendHandler = () => { router.refresh() }

        pusherClient.bind('new_message', newMessageHandler)
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toKeyPusher(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toKeyPusher(`user:${sessionId}:friends`))
            pusherClient.unbind('new_message', newMessageHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }

    }, [])


    return <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1' >{
        friends.sort().map((friend) => {
            const unseenMsgCount = unseenMessages?.filter((unseenMsg) => unseenMsg.senderId === friend.id).length
            return (<li key={friend.id} ><a href={`/dashboard/chat/${chatLinkConstructor(sessionId, friend.id)}`} className='truncate text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-md items-center'>{friend.name}
                {unseenMsgCount > 0 ? (
                    <div className='rounded-full w-4 h-4 text-xs flex justify-center items-center text-white bg-indigo-600'>
                        {unseenMsgCount}
                    </div>
                ) : null}
            </a></li>)
        })}</ul>
}

export default SideBarChatList