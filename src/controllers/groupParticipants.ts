import {Request, Response} from 'express'

import Group from '../models/Group'

const groupParticipants =
{
	listGroups: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const groupsAll = await Group.find()
		let groups: any[] = []

		groupsAll.map(group =>
		{
			let hasParticipant = false

			group.participants.map(participant =>
			{
				if (participant.email == String(email))
					hasParticipant = true
			})

			if (hasParticipant)
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
	}
}

export default groupParticipants