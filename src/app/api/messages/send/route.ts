import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toKeyPusher } from "@/lib/utils";
import { messageValidator } from "@/lib/validators/message";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();

    //check if there is a session currently
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //check if the current userId is in the chatId
    const [userId1, userId2] = chatId.split("--");
    if (session.user.id != userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 400 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];

    console.log(friendList);
    const isFriends = friendList.includes(friendId);

    if (!isFriends) {
      return new Response("Unauthorized", { status: 400 });
    }

    //all valid
    const timestamp = Date.now();
    const messageData: Message = {
      text,
      senderId: session.user.id,
      receiverId: friendId,
      timestamp,
      id: uuidv4(),
    };

    const message = messageValidator.parse(messageData);

    //now trigering the pusher function for real time messages

    pusherServer.trigger(
      toKeyPusher(`chat:${chatId}`),
      "incoming_message",
      message
    );

    //extending message to include image and name of the sender, to show this on the toaser notification
    pusherServer.trigger(toKeyPusher(`user:${friendId}:chats`), "new_message", {
      ...message,
      senderImage: session.user.image,
      senderName: session.user.name,
    });

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
