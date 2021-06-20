function getKey(type: string, id: number, language?: string)
{
	const key = (language && language !== '' && language !== 'undefined')
		? `${type}__${id}__${language}`
		: `${type}__${id}`

	return key
}

export default getKey