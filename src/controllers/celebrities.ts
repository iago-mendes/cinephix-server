import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import {PersonListPaginated} from '../models/Person'
import formatImage from '../utils/formatImage'
import {showCelebrity} from '../services/tmdb/celebrities'

export default
{
	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {search, page: tmpPage} = req.query

		let page = 1
		if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
			page = Number(tmpPage)

		if (search && String(search).length > 100)
			return res.status(400).json({message: 'Your search query has more than 100 characters!'})

		const {data: people}:{data: PersonListPaginated} = (search && search !== '')
			? await api.get('/search/person', {params: {query: search, page}})
			: await api.get('/trending/person/day', {params: {page}})

		const list = people.results.map(person =>
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

			if (person.known_for && person.known_for.length !==0)
			{
				const media = person.known_for[0]

				if (media && media.media_type === 'movie')
					tmpKnownFor =
					{
						id: media.id,
						title: media.title,
						image: formatImage(media.poster_path),
						overview: media.overview,
						date: media.release_date
					}
				else if (media && media.media_type === 'tv')
					tmpKnownFor =
					{
						id: media.id,
						title: media.name,
						image: formatImage(media.poster_path),
						overview: media.overview,
						date: media.first_air_date
					}
			}

			return {
				id: person.id,
				image: formatImage(person.profile_path),
				name: person.name,
				knownForDepartment: person.known_for_department,
				knownFor: tmpKnownFor
			}
		})

		res.setHeader('page', people.page)
		res.setHeader('totalPages', people.total_pages)

		return res.json(list)
	},

	show: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {id} = req.params
		const celebrity = await showCelebrity(Number(id))

		return res.json(celebrity)
	}
}