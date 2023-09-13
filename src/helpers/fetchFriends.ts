import { fetchRedis } from "./redis"


export const getFriendsData = async (userId: string)=> {
    const friendIds = await fetchRedis('smembers', `user:${userId}:friends`)

//fetch and display friends
const friendsData: User[] = await Promise.all(friendIds.map(async (id: string) => {
    const response =  (await fetchRedis('get', `user:${id}`)) as string
    const result = await JSON.parse(response) as User
    return{
        id: result.id,
        email: result.email,
        name: result.name
    }
}))

return friendsData

}