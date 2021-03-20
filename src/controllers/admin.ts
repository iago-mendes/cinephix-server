import {Request, Response} from 'express'

import Group from '../models/Group'
import User from '../models/User'

const admin =
{
	stats: async (req: Request, res: Response) =>
	{
		const users = await User.find()
		const groups = await Group.find()

		const stats =
		{
			numberOfUsers: users.length,
			numberOfGroups: groups.length
		}

		return res.json(stats)
	}
}

export default admin