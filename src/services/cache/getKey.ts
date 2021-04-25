function getKey(type: string, id: number)
{
	const key = `${type}__${id}`

	return key
}

export default getKey