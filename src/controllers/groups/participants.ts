import {Request, Response} from 'express'

import Group from '../../models/Group'
import Event from '../../models/Event'
import isParticipantInGroup from '../../utils/isParticipantInGroup'
import User from '../../models/User'
import formatImage from '../../utils/formatImage'

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
				image: user ? user.image : formatImage(undefined),
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

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})

		const participant = group.participants.find(participant => participant.email === String(email))
		if (!participant)
			return res.status(404).json({message: 'Participant not found!'})

		return res.json(participant)
	},

	update: async (req: Request, res: Response) =>
	{
		const {urlId, email} = req.params
		const {predictions} = req.body

		if (!email)
			return res.status(400).json({message: 'You need to provide an email!'})

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})

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
	}
}

export default groupParticipants