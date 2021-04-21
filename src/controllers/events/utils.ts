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
				resultId: category.result,
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
		
		const categories = event.categories.map(category =>
			{
				const resultObj = results.find(({categoryId}) => categoryId === String(category._id))
				const result = resultObj
					? resultObj.resultId
					: category.result

				return {
					_id: category._id,
					name: category.name,
					index: category.index,
					description: category.description,
					type: category.type,
					media: category.media,
					celebrities: category.celebrities,
					result
				}
			})

		let status = event.status
		status.hasResults = hasResults

		const updatedEvent = await Event.findByIdAndUpdate(event._id, {status, categories}, {new: true})
		
		return res.json(updatedEvent)
	}
}

export default eventsUtils