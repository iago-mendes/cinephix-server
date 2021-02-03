import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import {PersonListPaginated, PersonDetails, PersonCombinedCredits} from '../models/Person'
import formatImage from '../utils/formatImage'
import sortByPopularity from '../utils/sortByPopularity'

export default
{
	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {search, page: tmpPage} = req.query

		let page = 1
		if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
			page = Number(tmpPage)

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

		const {data: person}:{data: PersonDetails} = await api.get(`/person/${id}`)
		const {data: credits}:{data: PersonCombinedCredits} = await api.get(`/person/${id}/combined_credits`)

		return res.json(
		{
			id: person.id,
			name: person.name,
			image: formatImage(person.profile_path),
			biography: person.biography,
			knownForDepartment: person.known_for_department,
			birthday: person.birthday,
			placeOfBirth: person.place_of_birth,
			credits:
			{
				cast: credits.cast.sort(sortByPopularity).map(media => (
				{
					id: media.id,
					title: media.media_type === 'movie' ? media.title : media.name,
					image: formatImage(media.poster_path),
					character: media.character,
					overview: media.overview,
					date: media.media_type === 'movie' ? media.release_date : media.first_air_date,
					type : media.media_type === 'movie' ? 'movie' : 'tvshow'
				})),
				crew: credits.crew.sort(sortByPopularity).map(media => (
				{
					id: media.id,
					title: media.media_type === 'movie' ? media.title : media.name,
					image: formatImage(media.poster_path),
					overview: media.overview,
					date: media.media_type === 'movie' ? media.release_date : media.first_air_date,
					department: media.department,
					type : media.media_type === 'movie' ? 'movie' : 'tvshow'
				}))
			}
		})
	}
}