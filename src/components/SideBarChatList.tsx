'use client'
import { chatLinkConstructor } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'

interface SideBarChatListProps {
    friends: User[],
    userId: string
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, userId }) => {
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


    return <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1' >{
        friends.sort().map((friend) => {
            const unseenMsgCount = unseenMessages?.filter((unseenMsg) => unseenMsg.senderId === friend.id).length
            return (<li key={friend.id} ><a href={`/dashboard/chat/${chatLinkConstructor(userId, friend.id)}`} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm items-center'>{friend.name}
                {unseenMsgCount > 0 ? (
                    <div className='rounded-full w-4 h-4 text-xs flex justify-center items-center text-white bg-indigo-600'>
                        {unseenMsgCount}
                    </div>
                ) : null}
            </a></li>)
        })}</ul>
}

export default SideBarChatList