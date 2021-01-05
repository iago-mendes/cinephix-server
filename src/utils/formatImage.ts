export default function formatImage(path: string | undefined, size: string = 'w780')
{
	if (path)
		return `https://image.tmdb.org/t/p/${size}${path}`
	else
		return `${process.env.BASE_URL}/assets/no-image.svg`
}