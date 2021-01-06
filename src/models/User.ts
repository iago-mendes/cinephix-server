import mongoose from 'mongoose'

export type UserType = mongoose.Document & 
{
	_id?: string
	email: string
	joinedAt?: Date
	ratings:
	{
		movies: Array<
		{
			movieId: number

			screenplay: number
			pacing: number
			acting: number
			cinematography: number
			musicAndSound: number
		}>
		tvshows: Array<
		{
			tvshowId: number

			engagement: number
			consistency: number
			screenplay: number
			acting: number
			cinematography: number
			musicAndSound: number
		}>
	}
}

const UserSchema = new mongoose.Schema(
{
	email: {type: String, required: true, unique: true},
	joinedAt: {type: Date, default: Date.now()},
	ratings:
	{
		movies:
		[{
			movieId: {type: Number, required: true},

			screenplay: {type: Number, required: true},
			pacing: {type: Number, required: true},
			acting: {type: Number, required: true},
			cinematography: {type: Number, required: true},
			musicAndSound: {type: Number, required: true}
		}],
		tvshows:
		[{
			tvshowId: {type: Number, required: true},
			
			engagement: {type: Number, required: true},
			consistency: {type: Number, required: true},
			screenplay: {type: Number, required: true},
			acting: {type: Number, required: true},
			cinematography: {type: Number, required: true},
			musicAndSound: {type: Number, required: true}
		}]
	}
})

export default mongoose.model<UserType>('User', UserSchema)