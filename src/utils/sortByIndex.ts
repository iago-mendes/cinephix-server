function sortByIndex(a: any, b: any)
{
	if (!a.index && !b.index)
		return 0
	if ((a.index && !b.index) || a.index < b.index)
		return -1
	if ((!a.index && b.index) || a.index > b.index)
		return 1
}

export default sortByIndex