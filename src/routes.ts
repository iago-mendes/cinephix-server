import express from 'express'

import movies from './controllers/movies'
import tvshows from './controllers/tvshows'
import celebrities from './controllers/celebrities'
import {home, tmdb} from './controllers'
import users from './controllers/users'
import userMovies from './controllers/userMovies'
import userTvshows from './controllers/userTvshows'

const routes = express.Router()

routes.get('/', (req, res) => res.json({message: 'Welcome! This is the server of the Cinephix applications.'}))

routes.get('/home', home)

routes.get('/tmdb/*', tmdb)
routes.post('/tmdb/*', tmdb)

routes.get('/movies', movies.list)
routes.get('/movies/:id', movies.show)

routes.get('/tvshows', tvshows.list)
routes.get('/tvshows/:id', tvshows.show)

routes.get('/celebrities', celebrities.list)
routes.get('/celebrities/:id', celebrities.show)

routes.post('/users', users.join)
routes.get('/users', users.list)
routes.get('/users/:email', users.show)
routes.delete('/users/:email', users.remove)

routes.post('/users/:email/movies', userMovies.add)
routes.put('/users/:email/movies/:id', userMovies.edit)
routes.delete('/users/:email/movies/:id', userMovies.remove)
routes.get('/users/:email/movies', userMovies.list)
routes.get('/users/:email/movies/:id', userMovies.show)

routes.post('/users/:email/tvshows', userTvshows.add)
routes.put('/users/:email/tvshows/:id', userTvshows.edit)
routes.delete('/users/:email/tvshows/:id', userTvshows.remove)
routes.get('/users/:email/tvshows', userTvshows.list)
routes.get('/users/:email/tvshows/:id', userTvshows.show)

export default routes