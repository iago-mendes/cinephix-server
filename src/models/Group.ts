import mongoose from 'mongoose'

export interface Participant
{
	email: string
	isOwner: boolean
	predictions: Array<
	{
		category: string
		guess: number
	}>
}

export type GroupType = mongoose.Document & 
{
	_id: string
	nickname: string
	urlId: string
	banner?: string
	event: string
	description?: string
	participants: Participant[]
}

const GroupSchema = new mongoose.Schema(
{
	nickname: {type: String, required: true},
	urlId: {type: String, required: true, unique: true},
	banner: {type: String},
	description: {type: String},
	event: {type: String, ref: 'Event', required: true},
	participants:
	[{
		email: {type: String, required: true},
		isOwner: {type: Boolean, required: true},
		predictions:
		[{
			category: {type: mongoose.Schema.Types.ObjectId, ref: 'Event.categories', required: true},
			guess: {type: Number, required: true},
		}]
	}]
})
GroupSchema.index({nickname: 'text'})

export default mongoose.model<GroupType>('Group', GroupSchema)