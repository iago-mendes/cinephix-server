export interface Media
{
	id: number
	image?: string
	title?: string
	overview?: string
	date?: string
	type: string
}

export interface Celebrity
{
	celebrity:
	{
		id: number
		image?: string
		name?: string
	},
	media: Media
}