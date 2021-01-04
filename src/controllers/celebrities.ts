import {Request, Response, NextFunction} from 'express'

import api from '../services/api'
import {PersonSearchPaginated, PersonTrendingPaginated, PersonDetails} from '../models/Person'
import formatImage from '../utils/formatImage'

export default
{
	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {search, page: tmpPage} = req.query

		let list: Array<
		{
			id?: number
			name?: string
			image?: string
			knownForDepartment?: string
			knownFor?: any
		}> = []

		let page = 1
		if (tmpPage && Number(tmpPage) >= 1 && Number(tmpPage) <= 1000)
			page = Number(tmpPage)

		if (search && search !== '')
		{
			const {data: people}:{data: PersonSearchPaginated} = await api.get('/search/person', {params: {query: search, page}})

			list = people.results.map(person =>
			{
				let tmpKnownFor: Array<
				{
					id?: number
					title?: string
					image?: string
					overview?: string
					date?: string
				}> = []

				person.known_for?.map(media =>
				{
					if (media.media_type === 'movie')
						tmpKnownFor.push(
						{
							id: media.id,
							title: media.title,
							image: formatImage(media.poster_path),
							overview: media.overview,
							date: media.release_date
						})
					else if (media.media_type === 'tv')
						tmpKnownFor.push(
						{
							id: media.id,
							title: media.name,
							image: formatImage(media.poster_path),
							overview: media.overview,
							date: media.first_air_date
						})
				})

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
		}
		else
		{
			const {data: people}:{data: PersonTrendingPaginated} = await api.get('/trending/person/week', {params: {page}})

			list = people.results.map(person =>
			{
				let tmpKnownFor: Array<
				{
					id?: number
					title?: string
					image?: string
					overview?: string
					date?: string
				}> = []

				person.known_for?.map(media =>
				{
					if (media.media_type === 'movie')
						tmpKnownFor.push(
						{
							id: media.id,
							title: media.title,
							image: formatImage(media.poster_path),
							overview: media.overview,
							date: media.release_date
						})
					else if (media.media_type === 'tv')
						tmpKnownFor.push(
						{
							id: media.id,
							title: media.name,
							image: formatImage(media.poster_path),
							overview: media.overview,
							date: media.first_air_date
						})
				})

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
		}

		return res.json(list)
	}
}