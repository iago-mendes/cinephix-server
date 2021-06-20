import {Request, Response} from 'express'

import Group from '../../models/Group'
import Event from '../../models/Event'
import isParticipantInGroup from '../../utils/isParticipantInGroup'
import User from '../../models/User'
import formatImage, {formatUserImage} from '../../utils/formatImage'
import {Media, Celebrity} from '../../utils/interfaces'
import {showCelebrity} from '../../services/tmdb/celebrities'
import {showMovie} from '../../services/tmdb/movies'
import {showTvshow} from '../../services/tmdb/tvshows'

const groupParticipants =
{
	listGroups: async (req: Request, res: Response) =>
	{
		const {email} = req.params

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
			if (!isParticipantInGroup(String(email), group.participants))
				return

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

	list: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})
		
		let participants: Array<
		{
			email: string
			isOwner: boolean
			image?: string
			name?: string
		}> = []

		const promise = group.participants.map(async participant =>
		{
			const user = await User.findOne({email: participant.email})

			participants.push(
			{
				email: participant.email,
				isOwner: participant.isOwner,
				image: user ? formatUserImage(user.image) : formatUserImage(undefined),
				name: user ? user.name : 'Not registered user'
			})
		})
		await Promise.all(promise)

		return res.json(participants)
	},

	add: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params
		const {email} = req.body

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})
		
		let participants = group.participants
		if (isParticipantInGroup(String(email), participants))
			return res.status(400).json({message: `User with email ${email} is already in the group ${group.nickname}!`})
		
		participants.push(
		{
			email,
			isOwner: false,
			predictions: []
		})

		await Group.findByIdAndUpdate(group._id, {participants})
		return res.send()
	},

	remove: async (req: Request, res: Response) =>
	{
		const {urlId, email} = req.params

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})
		
		let participants = group.participants
		if (!isParticipantInGroup(String(email), participants))
			return res.status(400).json({message: `User with email ${email} is not in the group ${group.nickname}!`})
		
		participants = participants.filter(participant => participant.email !== String(email))

		await Group.findByIdAndUpdate(group._id, {participants})
		return res.send()
	},

	show: async (req: Request, res: Response) =>
	{
		const {urlId, email} = req.params
		const {language} = req.query

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})

		const event = await Event.findOne({id: group.event})
		if (!event)
			return res.status(404).json({message: 'Event not found!'})

		const rawParticipant = group.participants.find(participant => participant.email === String(email))
		if (!rawParticipant)
			return res.status(404).json({message: 'Participant not found!'})
		
		let predictions: Array<
		{
			guess: number
			category:
			{
				id: string
				name: string
				description: string
				type: string
				media: Media[]
				celebrities: Celebrity[]
			}
		}> = []

		const promise = rawParticipant.predictions.map(async ({category: categoryId, guess}) =>
		{
			const category = event.categories.find(({_id}) => String(_id) == String(categoryId))
			if (!category)
				return

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
							image: formatImage(celebrity.image),
							name: celebrity.name,
						},
						media:
						{
							id: mediaId,
							image: formatImage(media.image),
							title: media.title,
							overview: media.overview,
							date: mediaType === 'movie' ? media.date : media.startDate,
							type: mediaType
						}
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
						image: formatImage(movie.image),
						title: movie.title,
						overview: movie.overview,
						date: movie.date,
						type: 'movie'
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
						image: formatImage(tvshow.image),
						title: tvshow.title,
						overview: tvshow.overview,
						date: tvshow.startDate,
						type: 'tvshow'
					})
				})
				await Promise.all(promise2)
			}

			predictions.push(
			{
				guess,
				category:
				{
					id: String(category._id),
					name: category.name,
					description: category.description,
					type: category.type,
					media,
					celebrities
				}
			})
		})
		await Promise.all(promise)

		const participant =
		{
			email: rawParticipant.email,
			isOwner: rawParticipant.isOwner,
			predictions
		}

		return res.json(participant)
	},

	makePredictions: async (req: Request, res: Response) =>
	{
		const {urlId, email} = req.params
		const {predictions} = req.body

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})
		
		const event = await Event.findOne({id: group.event})
		if (!event)
			return res.status(404).json({message: 'Event not found!'})
		
		if (event.status.hasResults === true)
			return res.status(403).json({message: `${event.name} has results, so you cannot change your predictions!`})

		let participants = group.participants
		const index = participants.findIndex(participant => participant.email === String(email))
		if (index < 0)
			return res.status(404).json({message: 'Participant not found!'})

		participants[index].predictions = predictions
		await Group.findByIdAndUpdate(group._id, {participants})

		return res.send()
	},

	changeOwnership: async (req: Request, res: Response) =>
	{
		const {urlId, email} = req.params
		const {newOwnerEmail} = req.body

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})
		
		let participants = group.participants
		
		let oldOwnerIndex = participants.findIndex(participant => participant.email === String(email))
		if (oldOwnerIndex < 0)
			return res.status(400).json({message: `User with email ${email} is not in the group ${group.nickname}!`})

		let newOwnerIndex = participants.findIndex(participant => participant.email === String(newOwnerEmail))
		if (newOwnerIndex < 0)
			return res.status(400).json({message: `User with email ${newOwnerEmail} is not in the group ${group.nickname}!`})
		
		if (!participants[oldOwnerIndex].isOwner)
			return res.status(400).json({message: `User with email ${email} is not the owner of the group ${group.nickname}!`})
		
		participants[oldOwnerIndex].isOwner = false
		participants[newOwnerIndex].isOwner = true

		await Group.findByIdAndUpdate(group._id, {participants})
		return res.send()
	},

	raw: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})
		
		const participants = group.participants

		return res.json(participants)
	},

	rawOne: async (req: Request, res: Response) =>
	{
		const {urlId, email} = req.params

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})

		const participant = group.participants.find(participant => participant.email === String(email))
		if (!participant)
			return res.status(404).json({message: 'Participant not found!'})
		
		return res.json(participant)
	}
}

export default groupParticipants