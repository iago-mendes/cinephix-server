interface PersonList
{
	id?: number
	name?: string
	profile_path?: string
	media_type: string
	known_for_department?: string
	popularity?: number
	adult?: boolean
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
}

export interface PersonListPaginated
{
	page: number
	results: PersonList[]
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

export const defaultPersonDetails: PersonDetails =
{
	id: 0,
	name: 'Not found',
	birthday: '',
	known_for_department: '',
	deathday: '',
	also_known_as: [],
	gender: 0,
	biography: '',
	popularity: 0,
	place_of_birth: '',
	profile_path: '',
	adult: true,
	imdb_id: '',
	homepage: ''
}

export interface PersonCombinedCredits
{
	id: number
	cast: Array<
	{
		id?: number
		original_language?: string
		episode_count?: number
		overview?: string
		origin_country?: string[]
		original_name?: string
		genre_ids?: number[]
		name?: string
		media_type?: string
		poster_path?: string
		first_air_date?: string
		vote_average?: number
		vote_count?: number
		character?: string
		backdrop_path?: string
		popularity?: number
		credit_id?: string
		original_title?: string
		video?: boolean
		release_date?: string
		title?: string
		adult?: boolean
	}>
	crew: Array<
	{
		id?: number
		department?: string
		original_language?: string
		episode_count?: number
		job?: string
		overview?: string
		origin_country?: string[]
		original_name?: string
		vote_count?: number
		name?: string
		media_type?: string
		popularity?: number
		credit_id?: string
		backdrop_path?: string
		first_air_date?: string
		vote_average?: number
		genre_ids?: number[]
		poster_path?: string
		original_title?: string
		video?: boolean
		title?: string
		adult?: boolean
		release_date?: string
	}>
}

export const defaultPersonCombinedCredits: PersonCombinedCredits =
{
	id: 0,
	cast: [],
	crew: []
}