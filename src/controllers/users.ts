import {Request, Response} from 'express'

import User from '../models/User'

const users =
{
	signIn: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})

		if (user)
			return users.update(req, res)
		else
			return users.join(req, res)
	},

	join: async (req: Request, res: Response) =>
	{
		const {email} = req.params
		const {image, name} = req.body
		const date = Date.now()

		const userExists = await User.findOne({email})
		if (userExists)
			return res.status(400).json({message: `User with email '${email}' already exists!`})

		const user =
		{
			email,
			image,
			name,
			joinedAt: date,
			movies: [],
			tvshows: []
		}

		await User.create(user)
		return res.status(201).send()
	},

	update: async (req: Request, res: Response) =>
	{
		const {email} = req.params
		const {image, name, changedName} = req.body

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'User not found!'})

		const data =
		{
			image: image ? image : user.image,
			name: name && (!user.changedName || changedName === true) ? name : user.name,
			changedName: !user.changedName ? changedName === true : true
		}

		await User.findOneAndUpdate({email}, data)
		return res.send()
	},

	list: async (req: Request, res: Response) =>
	{
		const rawUsers = await User.find()

		const users = rawUsers.map(user => (
		{
			email: user.email,
			name: user.name,
			image: user.image,
			joinedAt: user.joinedAt
		}))

		return res.json(users)
	},

	show: async (req: Request, res: Response) =>
	{
		const {email} = req.params

		const user = await User.findOne({email})
		if (!user)
			return res.status(404).json({message: 'User not found!'})

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