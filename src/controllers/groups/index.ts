import {Request, Response} from 'express'

import Group from '../../models/Group'
import Event from '../../models/Event'
import {Media, Celebrity} from '../../utils/interfaces'
import { showCelebrity } from '../../services/tmdb/celebrities'
import { showMovie } from '../../services/tmdb/movies'
import { showTvshow } from '../../services/tmdb/tvshows'

const groups =
{
	create: async (req: Request, res: Response) =>
	{
		const {nickname, urlId, banner, event, description, participants} = req.body

		const group =
		{
			nickname,
			urlId,
			banner,
			event,
			description,
			participants
		}

		await Group.create(group)
		return res.json(group)
	},

	update: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params
		const {nickname, banner, event, description, participants} = req.body

		const previous = await Group.findOne({urlId})
		if (!previous)
			return res.status(404).json({message: 'Group not found!'})

		const group =
		{
			nickname: nickname || previous.nickname,
			banner: banner || previous.banner,
			event: event || previous.event,
			description: description || previous.description,
			participants: participants || previous.participants,
		}

		await Group.findByIdAndUpdate(previous._id, group)
		return res.json(group)
	},

	list: async (req: Request, res: Response) =>
	{
		const rawGroups = await Group.find()

		let groups: Array<
		{
			nickname: string
			urlId: string
			banner?: string
			event:
			{
				id: string
				name: string
				color: string
				description: string
			}
			description?: string
		}> = []

		const promise = rawGroups.map(async group =>
		{
			const event = await Event.findOne({id: group.event})

			groups.push(
			{
				nickname: group.nickname,
				urlId: group.urlId,
				banner: group.banner,
				event:
				{
					id: event ? event.id : '',
					name: event ? event.name : '',
					color: event ? event.color : '',
					description: event ? event.description : ''
				},
				description: group.description
			})
		})
		await Promise.all(promise)

		return res.json(groups)
	},

	show: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params

		const rawGroup = await Group.findOne({urlId})
		if (!rawGroup)
			return res.status(404).json({message: 'Group not found!'})
		
		const rawEvent = await Event.findOne({id: rawGroup.event})
		if (!rawEvent)
			return res.status(404).json({message: 'Event not found!'})

		interface Prediction
		{
			category:
			{
				id: string,
				name: string,
				description: string,
				type: string
			},
			guess: Media | Celebrity
		}
		let participants: Array<
		{
			email: string,
			isOwner: boolean,
			predictions: Prediction[]
		}> = []

		let participantGuesses: Array<
		{
			category: string
			guess: number
			participants: Array<
			{
				image: string
				name: string
				email: string
			}>
		}> = []

		const promise = rawGroup.participants.map(async participant =>
		{
			let tmpPredictions: Prediction[] = []

			const promise2 = participant.predictions.map(async prediction =>
			{
				const rawCategory = rawEvent.categories.find(({_id}) => String(_id) == String(prediction.category))
				if (!rawCategory)
					return
				
				const category =
				{
					id: String(rawCategory._id),
					name: rawCategory.name,
					description: rawCategory.description,
					type: rawCategory.type
				}

				if (category.type === 'celebrities')
				{
					const celebrity = await showCelebrity(prediction.guess)
					const ids = rawCategory.celebrities.find(({celebrity: id}) => String(id) == String(celebrity.id))
					if (!ids)
						return
					
					const media: any = ids.mediaType === 'movie'
						? await showMovie(ids.media)
						: await showTvshow(ids.media)

					const tmpGuess: Celebrity =
					{
						celebrity:
						{
							id: ids.celebrity,
							image: celebrity.image,
							name: celebrity.name,
						},
						media:
						{
							id: ids.media,
							image: media.image,
							title: media.title,
							overview: media.overview,
							date: ids.mediaType === 'movie' ? media.date : media.startDate,
							type: ids.mediaType
						}
					}

					tmpPredictions.push(
					{
						category,
						guess: tmpGuess
					})
				}
				else if (category.type === 'movies')
				{
					const movie = await showMovie(prediction.guess)
					if (!movie)
						return
					
					const tmpGuess: Media =
					{
						id: prediction.guess,
						image: movie.image,
						title: movie.title,
						overview: movie.overview,
						date: movie.date,
						type: 'movie'
					}

					tmpPredictions.push(
					{
						category,
						guess: tmpGuess
					})
				}
				else if (category.type === 'tvshows')
				{
					const tvshow = await showTvshow(prediction.guess)
					if (!tvshow)
						return

					const tmpGuess: Media =
					{
						id: prediction.guess,
						image: tvshow.image,
						title: tvshow.title,
						overview: tvshow.overview,
						date: tvshow.startDate,
						type: 'tvshow'
					}
				}
			})
			await Promise.all(promise2)

			participants.push(
			{
				email: participant.email,
				isOwner: participant.isOwner,
				predictions: tmpPredictions
			})
		})
		await Promise.all(promise)
		
		const event =
		{
			id: rawEvent.id,
			name: rawEvent.name,
			color: rawEvent.color,
			description: rawEvent.description,
		}
		
		const group =
		{
			urlId: rawGroup.urlId,
			banner: rawGroup.banner,
			nickname: rawGroup.nickname,
			description: rawGroup.description,
			participants,
			event
		}

		return res.json(group)
	},

	raw: async (req: Request, res: Response) =>
	{
		const groups = await Group.find()
		return res.json(groups)
	},

	rawOne: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params
		const group = await Group.findOne({urlId})
		
		return res.json(group)
	}
}

export default groups