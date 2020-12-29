import express from 'express'

import movies from './controllers/movies'

const routes = express.Router()

routes.get('/', (req, res) => res.json({message: 'Welcome! This is the server of the Cinephix applications.'}))

routes.get('/movies', movies.list)

export default routes