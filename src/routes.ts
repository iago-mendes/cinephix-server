import express from 'express'

import api from './api'

const routes = express.Router()

routes.get('/', (req, res) => res.json({message: 'Hello world!'}))

routes.get('/test', async (req, res) =>
{
	const params = {query: 'avengers'}

	// const {data: test} = await api.get('/movie/550')
	const {data: test} = await api.get('/search/movie', {params})

	return res.json(test)
})

export default routes