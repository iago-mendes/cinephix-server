import mongoose from 'mongoose'

export type UserType = mongoose.Document & 
{
	_id: string
	email: string
	joinedAt?: Date
	movies: Array<
	{
		movieId: number

		watched: boolean
		venue?: string

		ratings:
		{
			screenplay?: number
			pacing?: number
			acting?: number
			cinematography?: number
			musicAndSound?: number
		}
	}>
	tvshows: Array<
	{
		tvshowId: number

		status?: string
		venue?: string

		ratings?:
		{
			engagement?: number
			consistency?: number
			screenplay?: number
			acting?: number
			cinematography?: number
			musicAndSound?: number
		}
	}>
}

const UserSchema = new mongoose.Schema(
{
	email: {type: String, required: true, unique: true},
	joinedAt: {type: Date, default: Date.now()},
	movies:
	[{
		movieId: {type: Number, required: true, unique: true},

		watched: {type: Boolean, required: true},
		venue: {type: String, required: false},
		
		ratings:
		{
			screenplay: {type: Number, required: false},
			pacing: {type: Number, required: false},
			acting: {type: Number, required: false},
			cinematography: {type: Number, required: false},
			musicAndSound: {type: Number, required: false}
		}
	}],
	tvshows:
	[{
		tvshowId: {type: Number, required: true, unique: true},

		status: {type: String, required: false},
		venue: {type: String, required: false},
		
		ratings:
		{
			engagement: {type: Number, required: false},
			consistency: {type: Number, required: false},
			screenplay: {type: Number, required: false},
			acting: {type: Number, required: false},
			cinematography: {type: Number, required: false},
			musicAndSound: {type: Number, required: false}
		}
	}]
})

export default mongoose.model<UserType>('User', UserSchema)