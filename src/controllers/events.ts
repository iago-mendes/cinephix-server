import {Request, Response} from 'express'

import Event from '../models/Event'

const events =
{
	create: async (req: Request, res: Response) =>
	{
		const {id, name, color, description, categories} = req.body

		const event =
		{
			id,
			name,
			color,
			description,
			categories
		}

		const created = await Event.create(event)
		return res.json(created)
	},

	update: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		const {name, color, description, categories} = req.body

		const previous = await Event.findOne({id})
		if (!previous)
			return res.status(404).json({message: 'Event not found!'})

		const event =
		{
			name: name ? name : previous.name,
			color: color ? color : previous.color,
			description: description ? description : previous.description,
			categories: categories ? categories : previous.categories
		}

		const updated = await Event.updateOne({id}, event, {new: true})
		return res.json(updated)
	}
}

export default events