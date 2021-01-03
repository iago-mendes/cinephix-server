import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const api = axios.create(
{
	baseURL: 'https://api.themoviedb.org/3',
	params:
	{
		api_key: process.env.TMDB_KEY
	}
})

export default api