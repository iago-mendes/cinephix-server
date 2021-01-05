export default function sortByPopularity(a: any, b: any)
{
	if (Number(a.popularity) < Number(b.popularity))
		return 1
	else
		return -1
}