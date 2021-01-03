import {Request, Response, NextFunction} from 'express'

import api from '../api'
import {TvDetails, TvSearchPaginated, TvTrendingPaginated} from '../models/Tv'
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
			overview?: string
			date?: string
		}> = []

		let page = 1
		if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
			page = Number(tmpPage)

		if (search && search !== '')
		{
			const {data: tvshows}:{data: TvSearchPaginated} = await api.get('/search/tv', {params: {query: search, page}})

			list = tvshows.results.map(tvshow => (
			{
				id: tvshow.id,
				image: formatImage(tvshow.poster_path),
				title: tvshow.name,
				overview: tvshow.overview,
				date: tvshow.first_air_date
			}))

			res.setHeader('page', tvshows.page)
			res.setHeader('totalPages', tvshows.total_pages)
		}
		else
		{
			const {data: tvshows}:{data: TvTrendingPaginated} = await api.get('/trending/tv/week', {params: {page}})

			list = tvshows.results.map(tvshow => (
			{
				id: tvshow.id,
				image: formatImage(tvshow.poster_path),
				title: tvshow.name,
				overview: tvshow.overview,
				date: tvshow.first_air_date
			}))

			res.setHeader('page', tvshows.page)
			res.setHeader('totalPages', tvshows.total_pages)
		}

		return res.json(list)
	},

	show: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {id} = req.params

		const {data: tvshow}:{data: TvDetails} = await api.get(`/tv/${id}`)

		res.json(
		{
			id: tvshow.id,
			title: tvshow.name,
			image: formatImage(tvshow.poster_path),
			overview: tvshow.overview,
			rating: tvshow.vote_average,
			status: tvshow.status,
			inProduction: tvshow.in_production,
			startDate: tvshow.first_air_date,
			endDate: tvshow.last_air_date,
			seasonsNumber: tvshow.number_of_seasons,
			episodesNumber: tvshow.number_of_episodes,
			genres: tvshow.genres
		})
	}
}