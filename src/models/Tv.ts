interface TvSearch
{
	poster_path?: string
	popularity?: number
	id?: number
	backdrop_path?: string
	vote_average?: number
	overview?: string
	first_air_date?: string
	origin_country?: string[]
	genre_ids?: number[]
	original_language?: string
	vote_count?: number
	name?: string
	original_name?: string
}

export interface TvSearchPaginated
{
	page: number
	results: TvSearch[]
	total_results: number
	total_pages: number
}

interface TvTrending
{
	vote_average: number
	original_name: string
	origin_country: string[]
	name: string
	backdrop_path: string
	id: number
	vote_count: number
	original_language: string
	poster_path: string
	first_air_date: string
	overview: string
	genre_ids: number[]
	popularity: number
	media_type: string
}

export interface TvTrendingPaginated
{
	page: number
	results: TvTrending[]
	total_results: number
	total_pages: number
}