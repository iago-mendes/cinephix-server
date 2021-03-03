import {Request, Response} from 'express'

import Event from '../models/Event'

interface Media
{
	id: number
	image: string
	title: string
	overview: string
	date: string
	type?: string
}

interface Celebrity
{
	id: number
	image: string
	name: string
	media: Media
}

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
		return res.status(201).json(created)
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

		const updated = await Event.updateOne({id}, event)
		return res.json(updated)
	},

	remove: async (req: Request, res: Response) =>
	{
		const {id} = req.params

		const removed = await Event.findOne({id})
		if (!removed)
			return res.status(404).json({message: 'Event not found!'})

		await Event.findByIdAndDelete(removed._id)

		return res.json(removed)
	},

	list: async (req: Request, res: Response) =>
	{
		const rawEvents = await Event.find()

		const events = rawEvents.map(event => (
		{
			id: event.id,
			name: event.name,
			color: event.color,
			description: event.description
		}))

		return res.json(events)
	},

	show: async (req: Request, res: Response) =>
	{
		const {id} = req.params

		const rawEvent = await Event.findOne({id})
		if (!rawEvent)
			return res.status(404).json({message: 'Event not found!'})

		interface Media
		{
			id: number
			image: string
			title: string
			overview: string
			date: string
		}
		
		interface Celebrity
		{
			id: number
			image: string
			name: string
			media: Media
		}

		const categories:
		{
			name: string
			description: string
			type: string 
			candidates: Array<Media | Celebrity>
		}[] = []

		const event =
		{
			id: rawEvent.id,
			name: rawEvent.name,
			color: rawEvent.color,
			description: rawEvent.description,
			categories
		}

		return res.json(event)
	}
}

export default events