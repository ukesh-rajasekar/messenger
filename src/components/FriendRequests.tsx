'use client'
import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'


interface FriendRequestsProps {
    incomingRequests: Requests[],
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({ incomingRequests, sessionId }) => {
    const router = useRouter()
    const [requests, setRequests] = useState<Requests[] | []>(incomingRequests)

    const acceptRequests = async(senderId: string) => {
        console.log('request accepting ...')
        await axios.post('/api/friends/accept', {id: senderId})
        setRequests((prev)=> prev.filter((req) => req.senderId !== senderId))
        router.refresh()
    }

    const denyRequests = async(senderId: string) => {
        console.log('request denying ...')
        await axios.post('/api/friends/deny', {id: senderId})
        setRequests((prev)=> prev.filter((req) => req.senderId !== senderId))
        router.refresh()
    }
    return (<>
        {requests.length === 0 ? (<p>No requests found</p>) : (requests.map((request) => {
            return (
                <div key={request.senderId} className='flex gap-4 items-center'>
                    <UserPlus className='text-black' />
                    <p className='font-medium text-lg'>{request.senderEmail}</p>
                    <button aria-label='accept friend' className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'><Check onClick={() => acceptRequests(request.senderId)} className='font-semibold text-white w-3/4 h-3/4' /></button>
                    <button aria-label='deny friend' className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'><X onClick={() => denyRequests(request.senderId)} className='font-semibold text-white w-3/4 h-3/4' /></button>

                </div>
            )
        }))}</>)
}

export default FriendRequests