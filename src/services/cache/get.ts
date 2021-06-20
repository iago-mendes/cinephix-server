import {promisify} from 'util'

import getCacheClient from './client'
import getKey from './getKey'
import validTypes from './validTypes'

async function getCache(type: string, id: number, language?: string)
{
	if (!validTypes.includes(type))
		return null
	
	const key = getKey(type, id, language)

	const cacheClient = getCacheClient()
	const getAsync = promisify(cacheClient.get).bind(cacheClient)
	const value = await getAsync(key)

	if (!value)
		return null
	
	const data = JSON.parse(value)
	
	return data
}

export default getCache