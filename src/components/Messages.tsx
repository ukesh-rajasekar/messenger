'use client';
import { pusherClient } from '@/lib/pusher';
import { cn, formatTimestamp, toKeyPusher } from '@/lib/utils';
import { Message } from '@/lib/validators/message';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';

interface MessagesProps {
   initialMessages: Message[];
   user: User;
   chatPartner: User;
   chatId: string;
}

const Messages: FC<MessagesProps> = ({
   initialMessages,
   user,
   chatPartner,
   chatId,
}) => {
   const [messages, setMessages] = useState<Message[]>(initialMessages);
   const scrollDownRef = useRef<HTMLDivElement | null>(null);
   const { id: sessionId, image: sessionImg } = user;
   let date =
      initialMessages.length > 0
         ? new Date(initialMessages[0].timestamp).toDateString()
         : null;
   let today = new Date().toDateString();

   useEffect(() => {
      //subscribing for real time feature
      pusherClient.subscribe(toKeyPusher(`chat:${chatId}`));

      const handleIncomingMessage = (message: Message) => {
         console.log('incoming_message pusher triggered...');
         setMessages((prev) => [...prev, message]);
      };
      pusherClient.bind('incoming_message', handleIncomingMessage);
      return () => {
         pusherClient.unsubscribe(toKeyPusher(`chat:${chatId}`));
         pusherClient.unbind('incoming_message', handleIncomingMessage);
      };
   });
   return (
      <div
         id='messages'
         className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch '>
         <div ref={scrollDownRef}>
            {messages.map((message, index) => {
               //grouping msgs by date
               let isGroupDate = false;
               const currDate = new Date(message.timestamp).toDateString();
               if (currDate !== date) {
                  isGroupDate = true;
                  date = currDate;
               }
               const isCurrentUser = message.senderId === sessionId;
               const hasNextMessageFromSameUser =
                  messages[index - 1]?.senderId === messages[index].senderId;
               return (
                  <div
                     className='chat-message'
                     key={`${message.id}-${message.timestamp}`}>
                     {index === 0 || isGroupDate ? (
                        <div className='full-width py-4 flex'>
                           <div className='border-b-2 flex-1 h-6' />
                           <div className='flex-2 rounded-full border border-gray-400 text-black hover:text-black-600 font-normal hover:font-semibold p-2 '>{`${
                              date === today ? 'Today' : date
                           }`}</div>
                           <div className='border-b-2 flex-1 h-6' />
                        </div>
                     ) : null}
                     <div
                        className={cn('flex items-end', {
                           'justify-end': isCurrentUser,
                        })}>
                        <div
                           className={cn(
                              'flex flex-col space-y-2 text-base max-w-xs mx-2',
                              {
                                 'order-1 items-end': isCurrentUser,
                                 'order-2 items-start': !isCurrentUser,
                              }
                           )}>
                           <span
                              className={cn(
                                 'px-4 py-2 rounded-lg inline-block',
                                 {
                                    'bg-indigo-600 text-white': isCurrentUser,
                                    'bg-gray-200 text-gray-900': !isCurrentUser,
                                    'rounded-br-none':
                                       !hasNextMessageFromSameUser &&
                                       isCurrentUser,
                                    'rounded-bl-none':
                                       !hasNextMessageFromSameUser &&
                                       !isCurrentUser,
                                 }
                              )}>
                              {message.text}{' '}
                              <span className='ml-2 text-xs text-gray-400'>
                                 {formatTimestamp(message.timestamp)}
                              </span>
                           </span>
                        </div>

                        <div
                           className={cn('relative w-8 h-8', {
                              'order-2': isCurrentUser,
                              'order-1': !isCurrentUser,
                              invisible: hasNextMessageFromSameUser,
                           })}>
                           <Image
                              fill
                              src={
                                 isCurrentUser ? sessionImg : chatPartner.image
                              }
                              alt='Profile picture'
                              referrerPolicy='no-referrer'
                              className='rounded-full'
                           />
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default Messages;
