import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toKeyPusher } from '@/lib/utils';
import { emailValidator, idValidator } from '@/lib/validators/email';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request) {
   try {
      const body = await req.json();

      const { id: idToAdd } = idValidator.parse(body);

      console.log(idToAdd, 'id to add');

      //check if there is a session currently
      const session = await getServerSession(authOptions);

      if (!session) {
         return new Response('Unauthorized', { status: 401 });
      }

      //check if the email is in platform
      if (!idToAdd) {
         return new Response("Can't find this person right now!", {
            status: 400,
         });
      }

      //if already a friend checks
      //first check on idToAdd friend list
      const isAlreadyFriend = await fetchRedis(
         'sismember',
         `user:${session.user.id}:friends`,
         idToAdd
      );

      if (isAlreadyFriend) {
         return new Response(`Already friends`, {
            status: 400,
         });
      }
      console.log('isAlreadyFriend?', isAlreadyFriend);

      //check if id is actually in incoming friend requests
      const checkRequestExist = await fetchRedis(
         'sismember',
         `user:${session.user.id}:incoming_friend_requests`,
         idToAdd
      );

      console.log('checkrequestexist?', checkRequestExist);

      if (!checkRequestExist) {
         return new Response(`No request found!`, {
            status: 400,
         });
      }
      //reques is valid, now accepting the request on both ends

      const [userRaw, friendRaw] = (await Promise.all([
         fetchRedis('get', `user:${session.user.id}`),
         fetchRedis('get', `user:${idToAdd}`),
      ])) as [string, string];

      const user = JSON.parse(userRaw) as User;
      const friend = JSON.parse(friendRaw) as User;

      // notify added user

      await Promise.all([
         pusherServer.trigger(
            toKeyPusher(`user:${idToAdd}:friends`),
            'new_friend',
            user
         ),
         pusherServer.trigger(
            toKeyPusher(`user:${session.user.id}:friends`),
            'new_friend',
            friend
         ),
         db.sadd(`user:${session.user.id}:friends`, idToAdd),
         db.sadd(`user:${idToAdd}:friends`, session.user.id),
         db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
      ]);

      return new Response('OK', { status: 200 });
   } catch (error) {
      if (error instanceof z.ZodError) {
         return new Response('Invalid request payload', { status: 422 });
      }
      return new Response('Invalid request', { status: 400 });
   }
}
