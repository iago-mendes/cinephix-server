import getCacheClient from './client'
import getKey from './getKey'
import validTypes from './validTypes'

function saveCache(type: string, id: number, data: unknown)
{
	if (!validTypes.includes(type))
		return {ok: false}
	
	const key = getKey(type, id)
	const exTime = 24 * 60 * 60 // 24h
	const value = JSON.stringify(data)
	
	const cacheClient = getCacheClient()
	cacheClient.setex(key, exTime, value)

	return {ok: true}
}

export default saveCache