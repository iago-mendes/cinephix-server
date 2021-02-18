import mongoose from 'mongoose'

export type EventType = mongoose.Document & 
{
	_id: string
	name: string
	color: string
	description: string
}

const EventSchema = new mongoose.Schema(
{
	name: {type: String, required: true},
	color: {type: String, required: true, unique: true},
	description: {type: String, required: true}
})
EventSchema.index({name: 'text'})

export default mongoose.model<EventType>('Event', EventSchema)