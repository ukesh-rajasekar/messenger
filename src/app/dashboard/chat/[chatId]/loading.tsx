import { cn } from '@/lib/utils'
import { FC } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface loadingProps {

}

const renderCurrentUserMsgs = (currentUser: boolean, isNextCurrentUser: boolean, width: number) => {
    return (
        <div
            className={cn('flex items-end', {
                'justify-end': currentUser,
            })}>
            <div
                className={cn(
                    'flex flex-col space-y-2 text-base max-w-xs mx-2',
                    {
                        'order-1 items-end': currentUser,
                        'order-2 items-start': !currentUser,
                    }
                )}>
                <Skeleton
                    className={cn('px-4 py-2 rounded-lg inline-block', {
                        'bg-indigo-600 text-white': currentUser,
                        'bg-gray-200 text-gray-900': !currentUser,
                        'rounded-br-none':
                            !isNextCurrentUser && currentUser,
                        'rounded-bl-none':
                            !isNextCurrentUser && !currentUser,
                    })} width={width} height={30} />
            </div>

            <div
                className={cn('relative w-8 h-8', {
                    'order-2': currentUser,
                    'order-1': !currentUser,
                    'invisible': isNextCurrentUser,
                })}>
                <Skeleton width={32} height={32} borderRadius={'50%'} className='rounded-full' />
            </div>
        </div>
    )
}

const loading: FC<loadingProps> = ({ }) => {
    const messages = [150, 200, 300, 200, 200]
    return <div className='flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-6rem)]'>
        <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
            <div className='relative flex items-center space-x-4'>
                {/* chat Header skeleton */}
                <div className='relative'>
                    <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                        <Skeleton width={48} height={48} borderRadius={'50%'} className='rounded-full ml-2' />
                    </div></div>
                <div className='flex flex-col leading-tight'>
                    <div className='text-xl flex items-center'>
                        <Skeleton width={200} height={28} />
                    </div>
                    <Skeleton width={150} height={20} />
                </div>
            </div>
        </div>

        {/* chatMessages skeleton */}


        <div id='messages' className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch '>
            <div>
                <div
                    className='chat-message'
                >
                    {messages.map((width) => {
                        return (
                            renderCurrentUserMsgs(true, false, width)
                        )
                    })}
                    {messages.map((width) => {
                        return (
                            renderCurrentUserMsgs(false, false, width)
                        )
                    })}
                    {renderCurrentUserMsgs(false, false, 200)}
                    {renderCurrentUserMsgs(true, false, 200)}
                    {renderCurrentUserMsgs(false, false, 100)}

                </div>
            </div>
        </div>






        {/* chatInput skeleton */}

        <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
            <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
                <div className='py-2' aria-hidden='true'><div className='py-px'>
                    <div className='h-9' /></div></div>

                <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                    <div className='flex-shrin-0'>
                        <Skeleton width={64} height={40} />
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default loading