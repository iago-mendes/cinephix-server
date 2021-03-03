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
		_id: string
		type: string
		candidates: number[]
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
		type: {type: String, required: true},
		candidates: [{type: Number}]
	}]
})
EventSchema.index({name: 'text'})

export default mongoose.model<EventType>('Event', EventSchema)