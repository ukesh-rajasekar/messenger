import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toKeyPusher } from '@/lib/utils';
import { emailValidator } from '@/lib/validators/email';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request) {
   try {
      const body = await req.json();
      const { email: emailToAdd } = emailValidator.parse(body.email);
      //making a fetch request
      const idToAdd = (await fetchRedis(
         'get',
         `user:email:${emailToAdd}`
      )) as string;

      console.log(idToAdd);

      //check if the email is in platform
      if (!idToAdd) {
         return new Response('This person does not exist.', { status: 400 });
      }

      //check if there is a session currently
      const session = await getServerSession(authOptions);

      if (!session) {
         return new Response('Unauthorized', { status: 401 });
      }

      //if an user is trying to add himself as a friend

      if (session.user.id === idToAdd) {
         return new Response('Cannot add yourself as a friend', {
            status: 400,
         });
      }

      //if already a friend checks
      //first check on idToAdd friend list
      const isAlreadyAdded = (await fetchRedis(
         'sismember',
         `user:${idToAdd}:incoming_friend_requests`,
         session.user.id
      )) as 0 | 1;

      if (isAlreadyAdded) {
         return new Response(`Request pending`, {
            status: 400,
         });
      }

      //next check on current user's friend list
      const isAlreadyAdded2 = (await fetchRedis(
         'sismember',
         `user:${session.user.id}:friends`,
         idToAdd
      )) as 0 | 1;

      if (isAlreadyAdded2) {
         return new Response(`${emailToAdd} is already in your friend list`, {
            status: 400,
         });
      }

      //reques is valid, now making the request

      //now trigering the pusher function for real time updates

      await pusherServer.trigger(
         toKeyPusher(`user:${idToAdd}:incoming_friend_requests`),
         'incoming_friend_requests',
         {
            senderId: session.user.id,
            senderEmail: session.user.email,
         }
      );

      db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

      return new Response('OK', { status: 200 });
   } catch (error) {
      if (error instanceof z.ZodError) {
         return new Response('Invalid request payload', { status: 422 });
      }
      return new Response('Invalid request', { status: 400 });
   }
}
