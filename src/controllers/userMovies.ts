import {Request, Response, NextFunction} from 'express'
import { MovieDetails } from '../models/Movie'

import User from '../models/User'
import api from '../services/api'
import formatImage from '../utils/formatImage'

interface Ratings
{
	screenplay?: number
	pacing?: number
	acting?: number
	cinematography?: number
	musicAndSound?: number
}

const validVenues =
[
	'Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Movie Theater', 'Other'
]

export default
{
	add: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params
		const {id, watched, venue, ratings}:
		{
			id: number,
			watched: boolean,
			venue: string | undefined,
			ratings: Ratings | undefined
		} = req.body

		if (typeof id !== typeof 0)
			return res.status(400).json({message: 'provided id is invalid!'})
		if (typeof watched !== typeof false)
			return res.status(400).json({message: 'provided watched is invalid!'})
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

		let movies = [...user.movies]
		let movieAlreadyAdded = movies.find(movie => movie.movieId === id) !== undefined
		if (movieAlreadyAdded)
			return res.status(400).json({message: 'movie with provided id is already added!'})

		const movie =
		{
			movieId: id,
			watched,
			venue,
			ratings: ratings || {}
		}
		movies.push(movie)

		await User.updateOne({email}, {movies})
		return res.json(movie)
	},

	edit: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email, id: tmpId} = req.params
		const {watched, venue, ratings}:
		{
			watched: boolean,
			venue: string | undefined,
			ratings: Ratings | undefined
		} = req.body

		const id = Number(tmpId)

		if (typeof watched !== typeof false)
			return res.status(400).json({message: 'provided watched is invalid!'})
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

		let movieIndex: number = 0
		let movie = user.movies.find((movie, index) =>
		{
			if (movie.movieId === id)
				movieIndex = index
			return movie.movieId === id
		})
		if (!movie)
			return res.status(404).json({message: 'movie not found!'})

		movie.watched = watched
		if (venue)
			movie.venue = venue
		if (ratings)
			movie.ratings = ratings

		let movies = user.movies
		movies[movieIndex] = movie

		await User.updateOne({email}, {movies})
		return res.json(movie)
	},

	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		let movies: Array<
		{
			data:
			{
				id?: number
				image?: string
				title?: string
				overview?: string
				date?: string
			}
			watched: boolean
			venue: string | undefined
			ratings: Ratings
		}> = []

		const promise = user.movies.map(async movie =>
		{
			const {data}:{data: MovieDetails} = await api.get(`/movie/${movie.movieId}`)

			movies.push(
			{
				data:
				{
					id: data.id,
					image: formatImage(data.poster_path),
					title: data.title,
					overview: data.overview,
					date: data.release_date
				},
				watched: movie.watched,
				venue: movie.venue,
				ratings: movie.ratings
			})
		})
		await Promise.all(promise)

		return res.json(movies)
	}
}