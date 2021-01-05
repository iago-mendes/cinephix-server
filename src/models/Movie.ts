interface MovieSearch
{
	poster_path?: string
	adult?: boolean
	overview?: string
	release_date?: string
	genre_ids?: number[]
	id?: number
	original_title?: string
	original_language?: string
	title?: string
	backdrop_path?: string
	popularity?: number
	vote_count?: number
	video?: boolean
	vote_average?: number
}

export interface MovieSearchPaginated
{
	page: number
	results: MovieSearch[]
	total_results: number
	total_pages: number
}

interface MovieTrending
{
	poster_path?: string
	adult?: boolean
	overview?: string
	release_date?: string
	genre_ids?: number[]
	id?: number
	original_title?: string
	original_language?: string
	title?: string
	backdrop_path?: string
	popularity?: number
	vote_count?: number
	video?: boolean
	vote_average?: number
}

export interface MovieTrendingPaginated
{
	page: number
	results: MovieTrending[]
	total_results: number
	total_pages: number
}

export interface MovieDetails
{
	adult?: boolean
	backdrop_path?: string
	belongs_to_collection?:
	{
		id: number
    name: string
    poster_path: string
	}
	budget?: number
	genres?: Array<
	{
		id?: number
		name?: string
	}>
	homepage?: string
	id?: number
	imdb_id?: string
	original_language?: string
	original_title?: string
	overview?: string
	popularity?: number
	poster_path?: string
	production_companies?: Array<
	{
		name?: string
		id?: number
		logo_path?: string
		origin_country?: string
	}>
	production_countries?: Array<
	{
		iso_3166_1?: string
		name?: string
	}>
	release_date?: string
	revenue?: number
	runtime?: number
	spoken_languages?: Array<
	{
		iso_639_1?: string
		name?: string
	}>
	status?: string
	tagline?: string
	title?: string
	video?: boolean
	vote_average?: number
	vote_count?: number
}

export interface MovieCredits
{
	id: number
	cast: Array<
	{
		adult?: boolean
		gender?: number
		id?: number
		known_for_department?: string
		name?: string
		original_name?: string
		popularity?: number
		profile_path?: string
		cast_id?: number
		character?: string
		credit_id?: string
		order?: number
	}>
	crew: Array<
	{
		adult?: boolean
		gender?: number
		id?: number
		known_for_department?: string
		name?: string
		original_name?: string
		popularity?: number
		profile_path?: string
		credit_id?: string
		department?: string
		job?: string
	}>
}