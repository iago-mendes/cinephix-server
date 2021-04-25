import redis, {RedisClient} from 'redis'

let cacheClient: RedisClient | null = null

export function getCacheClient()
{
	if (cacheClient === null)
		cacheClient = redis.createClient(6379)
	
	return cacheClient
}