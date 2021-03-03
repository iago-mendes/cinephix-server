import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import {MovieSearchPaginated, MovieTrendingPaginated} from '../models/Movie'
import formatImage from '../utils/formatImage'
import {showMovie} from '../services/tmdb/movies'

export default
{
	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {search, page: tmpPage} = req.query

		let list: Array<
		{
			id?: number
			image?: string
			title?: string
			overview?: string
			date?: string
		}> = []

		let page = 1
		if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
			page = Number(tmpPage)

		if (search && String(search).length > 100)
			return res.status(400).json({message: 'Your search query has more than 100 characters!'})

		if (search && search !== '')
		{
			const {data: movies}:{data: MovieSearchPaginated} = await api.get('/search/movie', {params: {query: search, page}})

			list = movies.results.map(movie => (
			{
				id: movie.id,
				image: formatImage(movie.poster_path),
				title: movie.title,
				overview: movie.overview,
				date: movie.release_date
			}))

			res.setHeader('page', movies.page)
			res.setHeader('totalPages', movies.total_pages)
		}
		else
		{
			const {data: movies}:{data: MovieTrendingPaginated} = await api.get('/trending/movie/day', {params: {page}})

			list = movies.results.map(movie => (
			{
				id: movie.id,
				image: formatImage(movie.poster_path),
				title: movie.title,
				overview: movie.overview,
				date: movie.release_date
			}))

			res.setHeader('page', movies.page)
			res.setHeader('totalPages', movies.total_pages)
		}

		return res.json(list)
	},

	show: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {id} = req.params

		const movie = await showMovie(Number(id))

		return res.json(movie)
	}
}