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

export function sortPredictionsByIndex(a: any, b: any)
{
	if (a.category.index === undefined && b.category.index === undefined)
		return 0
	if ((a.category.index !== undefined && b.category.index === undefined) || (a.category.index < b.category.index))
		return -1
	if ((a.category.index === undefined && b.category.index !== undefined) || (a.category.index > b.category.index))
		return 1
	
	return 0
}

export default sortByIndex