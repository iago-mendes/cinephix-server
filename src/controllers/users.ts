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
	}
}