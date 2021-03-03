import express from 'express'

import movies from './controllers/movies'
import tvshows from './controllers/tvshows'
import celebrities from './controllers/celebrities'
import {home, tmdb} from './controllers'
import users from './controllers/users'
import userMovies from './controllers/userMovies'
import userTvshows from './controllers/userTvshows'
import checkKey from './middlewares/checkKey'
import events from './controllers/events'

const routes = express.Router()

routes.get('/', (req, res) => res.json({message: 'Welcome! This is the server of the Cinephix applications.'}))

routes.get('/home', home)

routes.get('/tmdb/*', checkKey, tmdb)
routes.post('/tmdb/*', checkKey, tmdb)

routes.get('/movies', movies.list)
routes.get('/movies/:id', movies.show)

routes.get('/tvshows', tvshows.list)
routes.get('/tvshows/:id', tvshows.show)

routes.get('/celebrities', celebrities.list)
routes.get('/celebrities/:id', celebrities.show)

routes.post('/users/:email', checkKey, users.signIn)
routes.post('/users/:email/join', checkKey, users.join)
routes.put('/users/:email', checkKey, users.update)
routes.get('/users', checkKey, users.list)
routes.get('/users/:email', checkKey, users.show)
routes.delete('/users/:email', checkKey, users.remove)

routes.post('/users/:email/movies', checkKey, userMovies.add)
routes.put('/users/:email/movies/:id', checkKey, userMovies.edit)
routes.delete('/users/:email/movies/:id', checkKey, userMovies.remove)
routes.get('/users/:email/movies', checkKey, userMovies.list)
routes.get('/users/:email/movies/:id', checkKey, userMovies.show)

routes.post('/users/:email/tvshows', checkKey, userTvshows.add)
routes.put('/users/:email/tvshows/:id', checkKey, userTvshows.edit)
routes.delete('/users/:email/tvshows/:id', checkKey, userTvshows.remove)
routes.get('/users/:email/tvshows', checkKey, userTvshows.list)
routes.put('/users/:email/tvshows/status/:key', checkKey, userTvshows.sortStatus)
routes.get('/users/:email/tvshows/:id', checkKey, userTvshows.show)

routes.post('/events', checkKey, events.create)

export default routes