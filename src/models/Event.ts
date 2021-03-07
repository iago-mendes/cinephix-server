import mongoose from 'mongoose'

export type EventType = mongoose.Document & 
{
	_id: string
	id: string
	name: string
	color: string
	description: string
	categories: Array<
	{
		_id?: string
		name: string
		description: string
		type: string // 'movies' | 'tvshows' | 'celebrities'
		media: number[]
		celebrities: Array<
		{
			celebrity: number
			media: number
			mediaType: string // 'movie' | 'tvshow'
		}>
	}>
}

const EventSchema = new mongoose.Schema(
{
	id: {type: String, required: true, unique: true},
	name: {type: String, required: true},
	color: {type: String, required: true},
	description: {type: String, required: true},
	categories:
	[{
		name: {type: String, required: true},
		description: {type: String, required: true},
		type: {type: String, required: true},
		media: [{type: Number}],
		celebrities:
		[{
			celebrity: {type: Number, required: true},
			media: {type: Number},
			mediaType: {type: String}
		}]
	}]
})
EventSchema.index({name: 'text'})

export default mongoose.model<EventType>('Event', EventSchema)