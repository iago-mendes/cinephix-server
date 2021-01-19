import {Request, Response, NextFunction} from 'express'
import {TvCredits, TvDetails} from '../models/Tv'

import User from '../models/User'
import api from '../services/api'
import formatImage from '../utils/formatImage'
import sortByPopularity from '../utils/sortByPopularity'

interface Ratings
{
	engagement?: number
	consistency?: number
	screenplay?: number
	acting?: number
	cinematography?: number
	musicAndSound?: number
}

interface ListedTvshow
{
	id?: number
	image?: string
	title?: string
	venue: string | undefined
	ratings: Ratings
}

const validStatus =
[
	'watchList',	'watching',	'waiting',	'completed',	'stopped',	'paused'
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
			status: string,
			venue: string | undefined,
			ratings: Ratings | undefined
		} = req.body

		if (typeof id !== typeof 0)
			return res.status(400).json({message: 'provided id is invalid!'})
		if (!status || !validStatus.includes(status))
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

		let tvshowStatus = user.tvshowStatus
		tvshowStatus[status].unshift(tvshow.tvshowId)

		await User.updateOne({email}, {tvshows, tvshowStatus})
		return res.json(tvshow)
	},

	edit: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email, id: tmpId} = req.params
		const {status, statusIndex, venue, ratings}:
		{
			id: number,
			status: string | undefined,
			statusIndex: number | undefined,
			venue: string | undefined,
			ratings: Ratings | undefined
		} = req.body

		const id = Number(tmpId)

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

		let tvshowIndex: number = 0
		let tvshow = user.tvshows.find((tvshow, index) =>
		{
			if (tvshow.tvshowId === id)
				tvshowIndex = index
			return tvshow.tvshowId === id
		})
		if (!tvshow)
			return res.status(404).json({message: 'tv show not found!'})

		let tvshowStatus = user.tvshowStatus
		if (status)
		{
			tvshow.status = status

			validStatus.map(statusKey =>
			{
				const previousIndex = tvshowStatus[statusKey].findIndex(tvshowId => tvshowId === id)
				if (previousIndex >= 0)
					tvshowStatus[statusKey].splice(previousIndex, 1)

				if (status === statusKey && tvshow)
				{
					statusIndex
					? tvshowStatus[status].splice(statusIndex, 0, tvshow.tvshowId)
					: tvshowStatus[status].unshift(tvshow.tvshowId)
				}
			})
		}
		if (venue)
			tvshow.venue = venue
		if (ratings)
			tvshow.ratings = ratings

		let tvshows = user.tvshows
		tvshows[tvshowIndex] = tvshow

		await User.updateOne({email}, {tvshows, tvshowStatus})
		return res.json(tvshow)
	},

	remove: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email, id: tmpId} = req.params
		const id = Number(tmpId)

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		let tvshowIndex: number = 0
		const tvshow = user.tvshows.find((tvshow, index) =>
		{
			if (tvshow.tvshowId === id)
				tvshowIndex = index
			return tvshow.tvshowId === id
		})
		if (!tvshow)
			return res.status(404).json({message: 'tv show not found!'})

		let tvshows = user.tvshows
		tvshows.splice(tvshowIndex, 1)

		await User.updateOne({email}, {tvshows})
		return res.json({message: 'tv show was removed!'})
	},

	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		let tvshows: {[id: number]: ListedTvshow} = {}

		const promise = user.tvshows.map(async tvshow =>
		{
			const {data}:{data: TvDetails} = await api.get(`/tv/${tvshow.tvshowId}`)

			tvshows[Number(data.id)] =
			{
				id: data.id,
				image: formatImage(data.poster_path),
				title: data.name,
				venue: tvshow.venue,
				ratings: tvshow.ratings || {}
			}
		})
		await Promise.all(promise)

		let list: {[status: string]: ListedTvshow[]} = {}

		validStatus.map(status =>
		{
			list[status] = user.tvshowStatus[status].map((id) => tvshows[id])
		})

		return res.json(list)
	},

	show: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email, id: tmpId} = req.params
		const id = Number(tmpId)

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		const tvshow = user.tvshows.find(tvshow => tvshow.tvshowId === id)
		if (!tvshow)
			return res.status(404).json({message: 'tv show not found!'})

		const {data}:{data: TvDetails} = await api.get(`/tv/${id}`)
		const {data: credits}:{data: TvCredits} = await api.get(`/tv/${id}/credits`)

		return res.json(
		{
			data:
			{
				id: data.id,
				title: data.name,
				image: formatImage(data.poster_path),
				overview: data.overview,
				rating: data.vote_average,
				status: data.status,
				inProduction: data.in_production,
				startDate: data.first_air_date,
				endDate: data.last_air_date,
				seasonsNumber: data.number_of_seasons,
				episodesNumber: data.number_of_episodes,
				genres: data.genres,
				credits:
				{
					cast: credits.cast.sort(sortByPopularity).map(person => (
					{
						id: person.id,
						name: person.name,
						image: formatImage(person.profile_path),
						character: person.character
					})),
					crew: credits.crew.sort(sortByPopularity).map(person => (
					{
						id: person.id,
						name: person.name,
						image: formatImage(person.profile_path),
						department: person.department
					}))
				}
			},
			status: tvshow.status,
			venue: tvshow.venue,
			ratings: tvshow.ratings
		})
	}
}