import {Request, Response, NextFunction} from 'express'

export default function checkKey(req: Request, res: Response, next: NextFunction)
{
	const clientKey = req.headers['key']
	const key = process.env.KEY

	if (!clientKey)
		return res.status(403).json({message: 'this is a protected route and no key was provided!'})
	else if (String(clientKey) !== String(key))
		return res.status(403).json({message: 'provided key is invalid!'})
	else
		return next()
}