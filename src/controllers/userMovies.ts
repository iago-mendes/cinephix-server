import {Request, Response, NextFunction} from 'express'

import User from '../models/User'

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

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		let movies = [...user.movies]
		const movie =
		{
			movieId: id,
			watched,
			venue,
			ratings: ratings || {}
		}
		movies.push(movie)

		await User.updateOne({email}, {movies})
		return res.json(movies)
	}
}