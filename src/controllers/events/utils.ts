import {Request, Response} from 'express'

import Event from '../../models/Event'
import sortByIndex from '../../utils/sortByIndex'

const eventsUtils =
{
	getCategoriesRaw: async (req: Request, res: Response) =>
	{
		const {eventId} = req.params

		const event = await Event.findOne({id: eventId})
		if (!event)
			return res.status(404).json({message: 'Event not found!'})
		
		const categories = event.categories.sort(sortByIndex)
			.map(category => (
			{
				id: category._id,
				name: category.name,
				description: category.description,
				type: category.type,
				resultId: category.result || 'No result',
				mediaIds: category.media,
				celebrityIds: category.celebrities.map(celebrity => celebrity.celebrity)
			}))
		
		return res.json(categories)
	},

	setResults: async (req: Request, res: Response) =>
	{
		const {eventId} = req.params
		const {hasResults, results}:
		{
			hasResults: boolean
			results: Array<
			{
				categoryId: string
				resultId: number | undefined
			}>
		} = req.body

		const event = await Event.findOne({id: eventId})
		if (!event)
			return res.status(404).json({message: 'Event not found!'})
		
		let categories = event.categories

		results.map(({categoryId, resultId}) =>
		{
			let categoryIndex = categories.findIndex(({_id}) => categoryId == String(_id))

			if (categoryIndex >= 0)
				categories[categoryIndex].result = resultId
		})

		let status = event.status
		status.hasResults = hasResults

		const response = await Event.updateOne({id: event.id}, {status, categories})
		
		return res.json(response)
	}
}

export default eventsUtils