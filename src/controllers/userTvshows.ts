import {Request, Response, NextFunction} from 'express'
import { TvDetails } from '../models/Tv'

import User from '../models/User'
import api from '../services/api'
import formatImage from '../utils/formatImage'

interface Ratings
{
	engagement?: number
	consistency?: number
	screenplay?: number
	acting?: number
	cinematography?: number
	musicAndSound?: number
}

const validStatus =
[
	'Watch list',	'Watching',	'Waiting',	'Completed',	'Stopped',	'Paused'
]
const validVenues =
[
	'Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Movie Theater', 'Other'
]

export default
{
	add: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params
		const {id, status, venue, ratings}:
		{
			id: number,
			status: string | undefined,
			venue: string | undefined,
			ratings: Ratings | undefined
		} = req.body

		if (typeof id !== typeof 0)
			return res.status(400).json({message: 'provided id is invalid!'})
		if (status && !validStatus.includes(status))
			return res.status(400).json({message: 'provided status is invalid!'})
		if (venue && !validVenues.includes(venue))
			return res.status(400).json({message: 'provided venue is invalid!'})

		let areRatingsValid = true
		if (ratings)
			Object.values(ratings).map(rating =>
			{
				if (rating > 10 || rating < 0)
					areRatingsValid = false
			})
		if (!areRatingsValid)
			return res.status(400).json({message: 'provided rating are invalid (ratings must be between 0 and 10)!'})

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		let tvshows = user.tvshows
		let tvshowAlreadyAdded = tvshows.find(tvshow => tvshow.tvshowId === id) !== undefined
		if (tvshowAlreadyAdded)
			return res.status(400).json({message: 'tvshow with provided id is already added!'})

		const tvshow =
		{
			tvshowId: id,
			status,
			venue,
			ratings: ratings || {}
		}
		tvshows.push(tvshow)

		await User.updateOne({email}, {tvshows})
		return res.json(tvshow)
	},

	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		let tvshows: Array<
		{
			data:
			{
				id?: number
				image?: string
				title?: string
				overview?: string
				date?: string
			}
			status: string | undefined
			venue: string | undefined
			ratings: Ratings
		}> = []

		const promise = user.tvshows.map(async tvshow =>
		{
			const {data}:{data: TvDetails} = await api.get(`/tv/${tvshow.tvshowId}`)

			tvshows.push(
			{
				data:
				{
					id: data.id,
					image: formatImage(data.poster_path),
					title: data.name,
					overview: data.overview,
					date: data.first_air_date
				},
				status: tvshow.status,
				venue: tvshow.venue,
				ratings: tvshow.ratings || {}
			})
		})
		await Promise.all(promise)

		return res.json(tvshows)
	}
}