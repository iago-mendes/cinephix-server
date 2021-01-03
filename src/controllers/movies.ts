import {Request, Response, NextFunction} from 'express'

import api from '../api'
import {MovieSearchPaginated, MovieTrendingPaginated} from '../models/Movie'
import formatImage from '../utils/formatImage'

export default
{
	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {search} = req.query

		let list: Array<
		{
			id?: number
			image?: string
			title?: string
			genres?: number[]
		}> = []

		if (search && search !== '')
		{
			const data: MovieSearchPaginated = await (await api.get('/search/movie', {params: {query: search}})).data

			list = data.results.map(movie => (
			{
				id: movie.id,
				image: formatImage(movie.poster_path),
				title: movie.title,
				genres: movie.genre_ids
			}))
		}
		else
		{
			const data: MovieTrendingPaginated = await (await api.get('/trending/movie/week')).data

			list = data.results.map(movie => (
			{
				id: movie.id,
				image: formatImage(movie.poster_path),
				title: movie.title,
				genres: movie.genre_ids
			}))
		}

		return res.json(list)
	}
}