import mongoose from 'mongoose'

export type UserType = mongoose.Document & 
{
	_id?: string
	email: string
	joinedAt?: Date
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
	movies: Array<
	{
		movieId: number

		status: string
		venue: string

		ratings:
		{
			screenplay: number
			pacing: number
			acting: number
			cinematography: number
			musicAndSound: number
		}
	}>
}

const UserSchema = new mongoose.Schema(
{
	email: {type: String, required: true, unique: true},
	joinedAt: {type: Date, default: Date.now()},
	tvshows:
	[{
		tvshowId: {type: Number, required: true},

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
	}],
	movies:
	[{
		movieId: {type: Number, required: true},

		status: {type: String, required: false},
		venue: {type: String, required: false},
		
		ratings:
		{
			screenplay: {type: Number, required: false},
			pacing: {type: Number, required: false},
			acting: {type: Number, required: false},
			cinematography: {type: Number, required: false},
			musicAndSound: {type: Number, required: false}
		}
	}]
})

export default mongoose.model<UserType>('User', UserSchema)