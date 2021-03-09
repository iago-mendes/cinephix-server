import {Request, Response} from 'express'

import Group from '../models/Group'

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

		await Group.findByIdAndUpdate(previous.id, group)
		return res.json(group)
	}
}

export default groups