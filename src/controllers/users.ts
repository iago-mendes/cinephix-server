import {Request, Response} from 'express'

import User from '../models/User'

const users =
{
	signIn: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})

		if (user)
			users.update(req, res)
		else
			users.join(req, res)
	},

	join: async (req: Request, res: Response) =>
	{
		const {email} = req.params
		const {image, name} = req.body
		const date = Date.now()

		const user = await User.create({email, image, name, joinedAt: date, movies: [], tvshows: []})
		return res.json(user)
	},

	update: async (req: Request, res: Response) =>
	{
		const {email} = req.params
		const {image, name} = req.body

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'User not found!'})

		const data =
		{
			image: image ? image : user.image,
			name: name ? name : user.name
		}

		await User.create(data)
		return res.send()
	},

	list: async (req: Request, res: Response) =>
	{
		const users = await User.find()
		return res.json(users)
	},

	show: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		return res.json(user)
	},

	remove: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'user not found!'})

		await User.deleteOne(user)
		return res.json({message: 'user was removed!'})
	}
}

export default users