import {Request, Response, NextFunction} from 'express'

import api from '../api'
import {MovieSearchPaginated, MovieTrendingPaginated} from '../models/Movie'
import formatImage from '../utils/formatImage'

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
			genres?: number[]
		}> = []

		let page = 1
		if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
			page = Number(tmpPage)

		if (search && search !== '')
		{
			const data: MovieSearchPaginated = await (await api.get('/search/movie', {params: {query: search, page}})).data

			list = data.results.map(movie => (
			{
				id: movie.id,
				image: formatImage(movie.poster_path),
				title: movie.title,
				genres: movie.genre_ids
			}))

			res.setHeader('page', data.page)
			res.setHeader('totalPages', data.total_pages)
		}
		else
		{
			const data: MovieTrendingPaginated = await (await api.get('/trending/movie/week', {params: {page}})).data

			list = data.results.map(movie => (
			{
				id: movie.id,
				image: formatImage(movie.poster_path),
				title: movie.title,
				genres: movie.genre_ids
			}))

			res.setHeader('page', data.page)
			res.setHeader('totalPages', data.total_pages)
		}

		return res.json(list)
	}
}