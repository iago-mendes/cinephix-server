import {Request, Response, NextFunction} from 'express'

import api from '../api'
import {MovieList} from '../models/Movie'

export default
{
	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {search} = req.query

		let data: MovieList
		if (search && search !== '')
			data = await (await api.get('/search/movie', {params: {query: search}})).data
		else
			data = await (await api.get('/trending/movie/week')).data

		const list = data.results.map(movie => (
		{
			id: movie.id,
			image: movie.poster_path ? movie.poster_path : '',
			title: movie.title,
			genres: movie.genre_ids
		}))

		return res.json(list)
	}
}