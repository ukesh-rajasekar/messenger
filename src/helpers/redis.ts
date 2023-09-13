const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN

type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(command: Command, 
    ...args: (string | number) []){
    try{
        const commandURL = `${upstashRedisRestUrl}/${command}/${args.join('/')}`
        const response = await fetch(commandURL, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            cache: 'no-store',
        })

        if(!response.ok){
            throw new Error(`Error executing the Redis command: ${response.statusText}`)
        }

        const data = await response.json()
        return data.result

    }
    catch(error){
        console.log('ERROR:', error)
    }
}