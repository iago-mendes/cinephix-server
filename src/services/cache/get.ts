import {promisify} from 'util'

import getCacheClient from './client'
import getKey from './getKey'
import validTypes from './validTypes'

async function getCache(type: string, id: number)
{
	if (!validTypes.includes(type))
		return {ok: false, data: null}
	
	const key = getKey(type, id)

	const cacheClient = getCacheClient()
	const getAsync = promisify(cacheClient.get).bind(cacheClient)
	const value = await getAsync(key)

	if (!value)
		return {ok: true, data: null}
	
	const data = JSON.parse(value)
	
	return {ok: true, data}
}

export default getCache