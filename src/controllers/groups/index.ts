import {Request, Response} from 'express'

import Group from '../../models/Group'
import Event from '../../models/Event'

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

		await Group.findByIdAndUpdate(previous._id, group)
		return res.json(group)
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
	}
}

export default groups