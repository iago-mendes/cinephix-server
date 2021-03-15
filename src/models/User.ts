import mongoose from 'mongoose'

export type UserType = mongoose.Document & 
{
	_id: string
	email: string
	image?: string
	name?: string
	changedName: boolean
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

		status: string
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
	tvshowStatus:
	{
		[status: string]: number[]
	}
}

const UserSchema = new mongoose.Schema(
{
	email: {type: String, required: true, unique: true},
	image: {type: String},
	name: {type: String},
	changedName: {type: Boolean, default: false},
	joinedAt: {type: Date, default: Date.now()},
	movies:
	[{
		movieId: {type: Number, required: true},

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
		tvshowId: {type: Number, required: true},

		status: {type: String, required: true},
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
	tvshowStatus:
	{
		watchList: [{type: Number}],
		watching: [{type: Number}],
		waiting: [{type: Number}],
		completed: [{type: Number}],
		stopped: [{type: Number}],
		paused: [{type: Number}]
	}
})

export default mongoose.model<UserType>('User', UserSchema)