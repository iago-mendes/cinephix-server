export interface Media
{
	id: number
	image?: string
	title?: string
	overview?: string
	date?: string
	type: string
	isResult?: boolean
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
	isResult?: boolean
}