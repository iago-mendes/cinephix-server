import {Request, Response} from 'express'

import Group from '../models/Group'

const groups =
{
	create: async (req: Request, res: Response) =>
	{
		const {nickname, id, banner, event, description, participants} = req.body

		const group =
		{
			nickname,
			id,
			banner,
			event,
			description,
			participants
		}

		await Group.create(group)
		return res.json(group)
	}
}

export default groups