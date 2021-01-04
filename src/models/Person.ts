interface PersonTrending
{
	adult: boolean
	gender: number
	name: string
	id: number
	known_for: Array<
	{
		poster_path?: string
		adult?: boolean
		overview?: string
		release_date?: string
		original_title?: string
		genre_ids?: number[]
		id?: number
		media_type: string
		original_language?: string
		title?: string
		backdrop_path?: string
		popularity?: number
		vote_count?: number
		video?: boolean
		vote_average?: number
		first_air_date?: string // tv
		origin_country?: string[] // tv
		name?: string // tv
		original_name?: string // tv
	}>
	known_for_department: string
	profile_path: string
	popularity: number
	media_type: string
}

export interface PersonTrendingPaginated
{
	page: number
	results: PersonTrending[]
	total_results: number
	total_pages: number
}

interface PersonSearch
{
	profile_path?: string
	adult?: boolean
	id?: number
	known_for?: Array<
	{
		poster_path?: string
		adult?: boolean
		overview?: string
		release_date?: string
		original_title?: string
		genre_ids?: number[]
		id?: number
		media_type: string
		original_language?: string
		title?: string
		backdrop_path?: string
		popularity?: number
		vote_count?: number
		video?: boolean
		vote_average?: number
		first_air_date?: string // tv
		origin_country?: string[] // tv
		name?: string // tv
		original_name?: string // tv
	}>
	known_for_department?: string
	name?: string
	popularity?: number
}

export interface PersonSearchPaginated
{
	page: number
	results: PersonSearch[]
	total_results: number
	total_pages: number
}

export interface PersonDetails
{
	birthday?: string
	known_for_department?: string
	deathday?: string
	id?: number
	name?: string
	also_known_as?: string[]
	gender?: number
	biography?: string
	popularity?: number
	place_of_birth?: string
	profile_path?: string
	adult?: boolean
	imdb_id?: string
	homepage?: string
}