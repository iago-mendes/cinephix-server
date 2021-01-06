import {Request, Response, NextFunction} from 'express'

import User from '../models/User'

export default
{
	join: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.body
		const date = Date.now()

		const user = await User.create({email, joinedAt: date, movies: [], tvshows: []})
		return res.json(user)
	},

	list: async (req: Request, res: Response, next: NextFunction) =>
	{
		const users = await User.find()
		return res.json(users)
	},

	show: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params

		const user = await User.find({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})
		else if (user.length > 1)
			return res.status(409).json({message: 'there was found more than one user with the provided email'})

		return res.json(user[0])
	}
}