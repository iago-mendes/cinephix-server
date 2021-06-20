import {Request, Response} from 'express'

import Event from '../../models/Event'
import {showCelebrity} from '../../services/tmdb/celebrities'
import {showMovie} from '../../services/tmdb/movies'
import {showTvshow} from '../../services/tmdb/tvshows'
import {Media, Celebrity} from '../../utils/interfaces'
import sortByIndex from '../../utils/sortByIndex'

const events =
{
	create: async (req: Request, res: Response) =>
	{
		const {id, name, color, description, status, categories} = req.body

		const event =
		{
			id,
			name,
			color,
			description,
			status,
			categories
		}

		const created = await Event.create(event)
		return res.status(201).json(created)
	},

	update: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		const {name, color, description, status, categories} = req.body

		const previous = await Event.findOne({id})
		if (!previous)
			return res.status(404).json({message: 'Event not found!'})

		const event =
		{
			name: name ? name : previous.name,
			color: color ? color : previous.color,
			description: description ? description : previous.description,
			status: status ? status : previous.status,
			categories: categories ? categories : previous.categories
		}

		const updated = await Event.updateOne({id}, event)
		return res.json(updated)
	},

	remove: async (req: Request, res: Response) =>
	{
		const {id} = req.params

		const removed = await Event.findOne({id})
		if (!removed)
			return res.status(404).json({message: 'Event not found!'})

		await Event.findByIdAndDelete(removed._id)

		return res.json(removed)
	},

	list: async (req: Request, res: Response) =>
	{
		const rawEvents = await Event.find()
		const openEvents = rawEvents.filter(event => event.status.isOpen)

		const events = openEvents.map(event => (
		{
			id: event.id,
			name: event.name,
			color: event.color,
			description: event.description
		}))

		return res.json(events)
	},

	show: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		const {language} = req.query

		const rawEvent = await Event.findOne({id})
		if (!rawEvent)
			return res.status(404).json({message: 'Event not found!'})
		
		if (!rawEvent.status.isOpen)
			return res.status(401).json({message: `The event ${rawEvent.name} is not open!`})

		let categories:
		{
			id: string
			name: string
			index?: number
			description: string
			type: string
			media: Media[]
			celebrities: Celebrity[]
		}[] = []

		const promise = rawEvent.categories.map(async category =>
		{
			let media: Media[] = []
			let celebrities: Celebrity[] = []

			if (category.type === 'celebrities')
			{
				const promise2 = category.celebrities.map(async ({celebrity: celebrityId, media: mediaId, mediaType}) =>
				{
					const celebrity = await showCelebrity(celebrityId, String(language))
					const media: any = mediaType === 'movie'
						? await showMovie(mediaId)
						: await showTvshow(mediaId)
					
					celebrities.push(
					{
						celebrity:
						{
							id: celebrityId,
							image: celebrity.image,
							name: celebrity.name,
						},
						media:
						{
							id: mediaId,
							image: media.image,
							title: media.title,
							overview: media.overview,
							date: mediaType === 'movie' ? media.date : media.startDate,
							type: mediaType
						},
						isResult: category.result == celebrityId
					})
				})
				await Promise.all(promise2)
			}
			else if (category.type === 'movies')
			{
				const promise2 = category.media.map(async id =>
				{
					const movie = await showMovie(id, String(language))

					media.push(
					{
						id,
						image: movie.image,
						title: movie.title,
						overview: movie.overview,
						date: movie.date,
						type: 'movie',
						isResult: category.result == id
					})
				})
				await Promise.all(promise2)
			}
			else if (category.type === 'tvshows')
			{
				const promise2 = category.media.map(async id =>
				{
					const tvshow = await showTvshow(id, String(language))
					
					media.push(
					{
						id,
						image: tvshow.image,
						title: tvshow.title,
						overview: tvshow.overview,
						date: tvshow.startDate,
						type: 'tvshow',
						isResult: category.result == id
					})
				})
				await Promise.all(promise2)
			}

			categories.push(
			{
				id: String(category._id),
				name: category.name,
				index: category.index,
				description: category.description,
				type: category.type,
				media,
				celebrities
			})
		})
		await Promise.all(promise)

		categories = categories.sort(sortByIndex)

		const event =
		{
			id: rawEvent.id,
			name: rawEvent.name,
			color: rawEvent.color,
			description: rawEvent.description,
			categories
		}

		return res.json(event)
	},

	raw: async (req: Request, res: Response) =>
	{
		const events = await Event.find()
		return res.json(events)
	},

	rawOne: async (req: Request, res: Response) =>
	{
		const {id} = req.params

		const event = await Event.findOne({id})
		if (!event)
			return res.status(404).json({message: 'Event not found!'})

		return res.json(event)
	},
}

export default events