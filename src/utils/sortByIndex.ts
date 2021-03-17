function sortByIndex(a: any, b: any)
{
	if (a.index === undefined && b.index === undefined)
		return 0
	if ((a.index !== undefined && b.index === undefined) || (a.index < b.index))
		return -1
	if ((a.index === undefined && b.index !== undefined) || (a.index > b.index))
		return 1
	
	return 0
}

export default sortByIndex