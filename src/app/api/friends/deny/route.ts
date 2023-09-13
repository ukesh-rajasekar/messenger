import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailValidator, idValidator } from "@/lib/validators/email";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToDeny } = idValidator.parse(body);

    console.log(idToDeny, "id to add");

    //check if there is a session currently
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //check if the email is in platform
    if (!idToDeny) {
      return new Response("Can't find this request anymore!", { status: 400 });
    }


    //check if id is actually in incoming friend requests
    const checkRequestExist = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToDeny
    );

    console.log("checkrequestexist?", checkRequestExist);

    if (!checkRequestExist) {
      return new Response(`No requests found!`, {
        status: 400,
      });
    }
    //request is valid, now denying the friend request
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);
    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
