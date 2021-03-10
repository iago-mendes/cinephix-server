import {Request, Response} from 'express'

import Group from '../../models/Group'
import isParticipantInGroup from '../../utils/isParticipantInGroup'

const groupParticipants =
{
	listGroups: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const groupsAll = await Group.find()
		let groups: any[] = []

		groupsAll.map(group =>
		{
			if (isParticipantInGroup(String(email), group.participants))
				groups.push(group)
		})

		return res.json(groups)
	},

	listParticipants: async (req: Request, res: Response) =>
	{
		const {urlId} = req.params

		const group = await Group.findOne({urlId})
		if (!group)
			return res.status(404).json({message: 'Group not found!'})

		return res.json(group.participants)
	},

	addParticipant: async (req: Request, res: Response) =>
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
	}
}

export default groupParticipants