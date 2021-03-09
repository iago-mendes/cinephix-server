import mongoose from 'mongoose'

export type GroupType = mongoose.Document & 
{
	_id: string
	nickname: string
	id: string
	banner?: string
	event: string
	description?: string
	participants: Array<
	{
		email: string
		isOwner: boolean
		predictions: Array<
		{
			category: string
			guess: number
		}>
	}>
}

const GroupSchema = new mongoose.Schema(
{
	nickname: {type: String, required: true},
	id: {type: String, required: true, unique: true},
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