import {Request, Response} from 'express'

import Group, {GroupType, Participant} from '../../models/Group'
import Event from '../../models/Event'
import {Media, Celebrity} from '../../utils/interfaces'
import {showCelebrity} from '../../services/tmdb/celebrities'
import {showMovie} from '../../services/tmdb/movies'
import {showTvshow} from '../../services/tmdb/tvshows'
import User from '../../models/User'
import {formatUserImage} from '../../utils/formatImage'
import sortByIndex, {sortPredictionsByIndex} from '../../utils/sortByIndex'
import sortByName from '../../utils/sortByName'

const invalidIds = ['raw', 'participants', 'create']

const groups =
{
	create: async (req: Request, res: Response) =>
	{
		const {nickname, urlId, banner, event, description, participants}: GroupType = req.body

		if (!nickname || !urlId || !event || !participants)
			return res.status(400).json({message: 'You have not provided enough information!'})
		
		const existing = await Group.findOne({urlId})
		if (existing || invalidIds.includes(urlId))
			return res.status(400).json({message: 'Invalid group ID!'})

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
		return res.status(201).send()
	},

	update: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params
		const {nickname, banner, event, description, participants: emptyParticipants}:
		{
			nickname: string
			banner: string
			event: string
			description: string
			participants: Participant[]
		} = req.body

		const previous = await Group.findOne({urlId})
		if (!previous)
			return res.status(404).json({message: 'Group not found!'})
		
		let participants: Participant[] = emptyParticipants.map(emptyParticipant =>
		{
			const previousParticipant = previous.participants.find(({email}) => email === emptyParticipant.email)

			if (previousParticipant)
				return previousParticipant
			else
				return emptyParticipant
		})

		const group =
		{
			nickname: nickname ? nickname : previous.nickname,
			banner: banner ? banner : previous.banner,
			event: event ? event : previous.event,
			description: description ? description : previous.description,
			participants
		}

		await Group.findByIdAndUpdate(previous._id, group)
		return res.json(group)
	},

	remove: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params

		const removed = await Group.findOne({urlId})
		if (!removed)
			return res.status(404).json({message: 'Group not found!'})

		await Group.findByIdAndRemove(removed._id)
		return res.send()
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
		const {language} = req.query

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
				id: string
				name: string
				index?: number
				description: string
				type: string
			}
			guess: Media | Celebrity
		}
		let participants: Array<
		{
			image: string,
			name: string,
			email: string,
			isOwner: boolean,
			predictions: Prediction[]
			points: number
			isWinner: boolean
		}> = []

		interface ParticipantGuesses
		{
			predictionsQuantity: number
		}
		let participantGuesses:
		{
			[category: string]:
			{
				[guess: number]: ParticipantGuesses
			}
		} = {}

		let winnerParticipant =
		{
			email: '',
			points: -1
		}

		const promise = rawGroup.participants.map(async participant =>
		{
			let tmpPredictions: Prediction[] = []
			let points = 0

			const rawUser = await User.findOne({email: participant.email})
			const user =
			{
				email: participant.email,
				image: rawUser ? formatUserImage(rawUser.image) : formatUserImage(undefined),
				name: rawUser ? String(rawUser.name) : 'Not registered user'
			}

			const promise2 = participant.predictions.map(async prediction =>
			{
				const rawCategory = rawEvent.categories.find(({_id}) => String(_id) == String(prediction.category))
				if (!rawCategory)
					return
				
				const category =
				{
					id: String(rawCategory._id),
					name: rawCategory.name,
					index: rawCategory.index,
					description: rawCategory.description,
					type: rawCategory.type
				}

				if (category.type === 'celebrities')
				{
					const celebrity = await showCelebrity(prediction.guess, String(language))
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
						},
						isResult: rawCategory.result == celebrity.id
					}

					tmpPredictions.push(
					{
						category,
						guess: tmpGuess
					})
				}
				else if (category.type === 'movies')
				{
					const movie = await showMovie(prediction.guess, String(language))
					if (!movie)
						return
					
					const tmpGuess: Media =
					{
						id: prediction.guess,
						image: movie.image,
						title: movie.title,
						overview: movie.overview,
						date: movie.date,
						type: 'movie',
						isResult: rawCategory.result == movie.id
					}

					tmpPredictions.push(
					{
						category,
						guess: tmpGuess
					})
				}
				else if (category.type === 'tvshows')
				{
					const tvshow = await showTvshow(prediction.guess, String(language))
					if (!tvshow)
						return

					const tmpGuess: Media =
					{
						id: prediction.guess,
						image: tvshow.image,
						title: tvshow.title,
						overview: tvshow.overview,
						date: tvshow.startDate,
						type: 'tvshow',
						isResult: rawCategory.result == tvshow.id
					}
				}

				const categoryParticipantGuesses = participantGuesses[prediction.category]
				const hasExistingParticipantGuesses = categoryParticipantGuesses
					? categoryParticipantGuesses[prediction.guess] != undefined
					: false
				
				if (hasExistingParticipantGuesses)
					participantGuesses[prediction.category][prediction.guess].predictionsQuantity++
				else if (categoryParticipantGuesses != undefined)
					participantGuesses[prediction.category][prediction.guess] =
					{
						predictionsQuantity: 1
					}
				else
					participantGuesses[prediction.category] =
					{
						[prediction.guess]: {predictionsQuantity: 1}
					}
				
				if (prediction.guess == rawCategory.result)
					points++
			})
			await Promise.all(promise2)

			tmpPredictions.sort(sortPredictionsByIndex)

			if (points > winnerParticipant.points)
				winnerParticipant =
				{
					email: participant.email,
					points
				}

			participants.push(
			{
				...user,
				isOwner: participant.isOwner,
				predictions: tmpPredictions,
				points,
				isWinner: false
			})
		})
		await Promise.all(promise)

		let categories: Array<
		{
			id: string,
			name: string,
			index?: number
			description: string,
			type: string,
			media: Array<Media & ParticipantGuesses>,
			celebrities: Array<Celebrity & ParticipantGuesses>
		}> = []

		const promise2 = rawEvent.categories.map(async rawCategory =>
		{
			const category =
			{
				id: String(rawCategory._id),
				name: rawCategory.name,
				index: rawCategory.index,
				description: rawCategory.description,
				type: rawCategory.type
			}

			let media: Array<Media & ParticipantGuesses> = []
			let celebrities: Array<Celebrity & ParticipantGuesses> = []

			const categoryParticipantGuesses = participantGuesses[category.id]

			if (category.type === 'celebrities')
			{
				const promise3 = rawCategory.celebrities.map(async ({celebrity: celebrityId, media: mediaId, mediaType}) =>
				{
					const celebrity = await showCelebrity(celebrityId, String(language))
					const media: any = mediaType === 'movie'
						? await showMovie(mediaId)
						: await showTvshow(mediaId)
					
					const participantGuess = categoryParticipantGuesses
						? categoryParticipantGuesses[celebrityId]
						: {predictionsQuantity: 0}
					
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
							type: mediaType,
						},
						predictionsQuantity: participantGuess ? participantGuess.predictionsQuantity : 0,
						isResult: rawCategory.result == celebrityId
					})
				})
				await Promise.all(promise3)
			}
			else if (category.type === 'movies')
			{
				const promise3 = rawCategory.media.map(async id =>
				{
					const movie = await showMovie(id, String(language))

					const participantGuess = categoryParticipantGuesses
						? categoryParticipantGuesses[id]
						: {predictionsQuantity: 0}
					
					media.push(
					{
						id,
						image: movie.image,
						title: movie.title,
						overview: movie.overview,
						date: movie.date,
						type: 'movie',
						predictionsQuantity: participantGuess ? participantGuess.predictionsQuantity : 0,
						isResult: rawCategory.result == id
					})
				})
				await Promise.all(promise3)
			}
			else if (category.type === 'tvshows')
			{
				const promise3 = rawCategory.media.map(async id =>
				{
					const tvshow = await showTvshow(id, String(language))

					const participantGuess = categoryParticipantGuesses
						? categoryParticipantGuesses[id]
						: {predictionsQuantity: 0}
					
					media.push(
					{
						id,
						image: tvshow.image,
						title: tvshow.title,
						overview: tvshow.overview,
						date: tvshow.startDate,
						type: 'tvshow',
						predictionsQuantity: participantGuess ? participantGuess.predictionsQuantity : 0,
						isResult: rawCategory.result == id
					})
				})
				await Promise.all(promise3)
			}

			categories.push(
			{
				...category,
				media,
				celebrities
			})
		})
		await Promise.all(promise2)

		if (rawEvent.status.hasResults)
			participants = participants.map(participant =>
			{
				let tmpParticipant = participant

				if (tmpParticipant.email === winnerParticipant.email)
					tmpParticipant.isWinner = true
				
				return tmpParticipant
			})

		categories.sort(sortByIndex)
		participants.sort(
			rawEvent.status.hasResults
			? (a,b) =>
				{
					if (a.isWinner)
						return -1
					if (b.isWinner)
						return 1
					
					if (a.points > b.points)
						return -1
					else
						return 1
				}
			: sortByName
		)
		
		const event =
		{
			id: rawEvent.id,
			name: rawEvent.name,
			color: rawEvent.color,
			description: rawEvent.description,
			status: rawEvent.status,
			categories
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