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

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		return res.json(user)
	},

	remove: async (req: Request, res: Response, next: NextFunction) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		await User.deleteOne(user)
		return res.json({message: 'user was removed!'})
	}
}