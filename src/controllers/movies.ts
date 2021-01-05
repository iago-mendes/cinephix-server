import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import {MovieSearchPaginated, MovieTrendingPaginated, MovieDetails, MovieCredits} from '../models/Movie'
import formatImage from '../utils/formatImage'
import sortByPopularity from '../utils/sortByPopularity'

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
			const {data: movies}:{data: MovieTrendingPaginated} = await api.get('/trending/movie/week', {params: {page}})

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

		const {data: movie}:{data: MovieDetails} = await api.get(`/movie/${id}`)
		const {data: credits}:{data: MovieCredits} = await api.get(`/movie/${id}/credits`)

		res.json(
		{
			id: movie.id,
			title: movie.title,
			image: formatImage(movie.poster_path),
			overview: movie.overview,
			status: movie.status,
			date: movie.release_date,
			rating: movie.vote_average,
			collection: movie.belongs_to_collection &&
			{
				id: movie.belongs_to_collection.id,
				name: movie.belongs_to_collection.name,
				image: formatImage(movie.belongs_to_collection.poster_path)
			},
			genres: movie.genres,
			credits:
			{
				cast: credits.cast.sort(sortByPopularity).map(person => (
				{
					id: person.id,
					name: person.name,
					image: formatImage(person.profile_path),
					character: person.character
				})),
				crew: credits.crew.sort(sortByPopularity).map(person => (
				{
					id: person.id,
					name: person.name,
					image: formatImage(person.profile_path),
					department: person.department
				}))
			}
		})
	}
}