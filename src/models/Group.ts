import mongoose from 'mongoose'

export type GroupType = mongoose.Document & 
{
	_id: string
	nickname: string
	banner?: string
	event: string
	description?: string
	participants: Array<
	{
		email: string
		predictions: Array<
		{
			category: string
			media?: number
			celebrity?: number
		}>
	}>
}

const GroupSchema = new mongoose.Schema(
{
	nickname: {type: String, required: true},
	banner: {type: String},
	description: {type: String},
	event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true},
	participants:
	[{
		email: {type: String, required: true},
		predictions:
		[{
			category: {type: String, required: true},
			media: {type: Number},
			celebrity: {type: Number}
		}]
	}]
})
GroupSchema.index({nickname: 'text'})

export default mongoose.model<GroupType>('Group', GroupSchema)