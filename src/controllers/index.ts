import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import formatImage from '../utils/formatImage'

interface All
{
	page: number
	results: Array<
	{
		first_air_date?: string
		origin_country?: string[]
		original_name?: string
		poster_path?: string
		overview?: string
		release_date?: string
		genre_ids?: number[]
		original_title?: string
		original_language?: string
		title?: string
		backdrop_path?: string
		vote_count?: number
		video?: boolean
		vote_average?: number
		media_type: string
		profile_path?: string
		adult?: boolean
		id?: number
		known_for?: Array<
		{
			poster_path?: string
			adult?: boolean
			overview?: string
			release_date?: string
			original_title?: string
			genre_ids?: number[]
			id?: number
			media_type: string
			original_language?: string
			title?: string
			backdrop_path?: string
			popularity?: number
			vote_count?: number
			video?: boolean
			vote_average?: number
			first_air_date?: string // tv
			origin_country?: string[] // tv
			name?: string // tv
			original_name?: string // tv
		}>
		known_for_department?: string
		name?: string
		popularity?: number
	}>
	total_results: number
	total_pages: number
}

export async function home(req: Request, res: Response, next: NextFunction)
{
	const {search, page: tmpPage, language} = req.query

	let list: any = []

	let page = 1
	if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
		page = Number(tmpPage)
	
	if (search && String(search).length > 100)
		return res.status(400).json({message: 'Your search query has more than 100 characters!'})

	const {data: all}:{data: All} = (search && search !== '')
		? await api.get('/search/multi', {params: {query: search, page, language}})
		: await api.get('/trending/all/day', {params: {page, language}})

	all.results.map(item =>
	{
		if (item.media_type === 'movie')
		{
			list.push(
			{
				id: item.id,
				image: formatImage(item.poster_path),
				title: item.title,
				overview: item.overview,
				date: item.release_date,
				type: 'movie'
			})
		}
		else if (item.media_type === 'tv')
		{
			list.push(
			{
				id: item.id,
				image: formatImage(item.poster_path),
				title: item.name,
				overview: item.overview,
				date: item.first_air_date,
				type: 'tvshow'
			})
		}
		else if (item.media_type === 'person')
		{
			let tmpKnownFor:
			{
				id?: number
				title?: string
				image?: string
				overview?: string
				date?: string
			} =
			{
				id: 1,
				title: '',
				image: formatImage(undefined),
				overview: '',
				date: ''
			}

			if (item.known_for && item.known_for.length !==0)
			{
				const media = item.known_for[0]

				if (media.media_type === 'movie')
					tmpKnownFor =
					{
						id: media.id,
						title: media.title,
						image: formatImage(media.poster_path),
						overview: media.overview,
						date: media.release_date
					}
				else if (media.media_type === 'tv')
					tmpKnownFor =
					{
						id: media.id,
						title: media.name,
						image: formatImage(media.poster_path),
						overview: media.overview,
						date: media.first_air_date
					}
			}
			
			list.push(
			{
				id: item.id,
				image: formatImage(item.profile_path),
				name: item.name,
				knownForDepartment: item.known_for_department,
				knownFor: tmpKnownFor
			})
		}
	})

	res.setHeader('page', all.page)
	res.setHeader('totalPages', all.total_pages)

	return res.json(list)
}

export async function tmdb(req: Request, res: Response, next: NextFunction)
{
	const {path: tmpPath, query, body, method} = req
	const path = tmpPath.split('/tmdb').join('')

	const {data, headers} = method === 'GET'
		? await api.get(path, {params: query})
		: await api.post(path, {params: query, data: body})

	return res.json({data, headers})
}