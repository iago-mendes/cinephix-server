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