import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import {TvSearchPaginated, TvTrendingPaginated} from '../models/Tv'
import formatImage from '../utils/formatImage'
import {showTvshow} from '../services/tmdb/tvshows'

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
			const {data: tvshows}:{data: TvTrendingPaginated} = await api.get('/trending/tv/day', {params: {page}})

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
		const tvshow = await showTvshow(Number(id))

		return res.json(tvshow)
	}
}