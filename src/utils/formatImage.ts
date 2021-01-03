export default function formatImage(path: string | null, size: string = 'w780')
{
	if (path)
		return `https://image.tmdb.org/t/p/${size}${path}`
	else
		return 'no-image'
}