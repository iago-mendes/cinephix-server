import express from 'express'

import movies from './controllers/movies'
import tvshows from './controllers/tvshows'
import celebrities from './controllers/celebrities'

const routes = express.Router()

routes.get('/', (req, res) => res.json({message: 'Welcome! This is the server of the Cinephix applications.'}))

routes.get('/movies', movies.list)
routes.get('/movies/:id', movies.show)

routes.get('/tvshows', tvshows.list)
routes.get('/tvshows/:id', tvshows.show)

routes.get('/celebrities', celebrities.list)
routes.get('/celebrities/:id', celebrities.show)

export default routes