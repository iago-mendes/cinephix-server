import {Request, Response} from 'express'

import Event from '../models/Event'

const events =
{
	create: async (req: Request, res: Response) =>
	{
		const {name, color, description, categories} = req.body

		const event =
		{
			name,
			color,
			description,
			categories
		}

		const created = await Event.create(event)
		return res.json(created)
	}
}

export default events