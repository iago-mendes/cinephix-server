import {MovieCredits, MovieDetails} from '../../models/Movie'
import formatImage from '../../utils/formatImage'
import sortByPopularity from '../../utils/sortByPopularity'
import api from '../api'

export const showMovie = async (id: number) =>
{
	const {data: rawMovie}:{data: MovieDetails} = await api.get(`/movie/${id}`)
	const {data: credits}:{data: MovieCredits} = await api.get(`/movie/${id}/credits`)

	const movie =
	{
		id: rawMovie.id,
		title: rawMovie.title,
		image: formatImage(rawMovie.poster_path),
		overview: rawMovie.overview,
		status: rawMovie.status,
		date: rawMovie.release_date,
		rating: rawMovie.vote_average,
		collection: rawMovie.belongs_to_collection &&
		{
			id: rawMovie.belongs_to_collection.id,
			name: rawMovie.belongs_to_collection.name,
			image: formatImage(rawMovie.belongs_to_collection.poster_path)
		},
		genres: rawMovie.genres,
		credits:
		{
			cast: credits.cast.sort(sortByPopularity).map(person => (
			{
				id: person.id,
				name: person.name,
				image: formatImage(person.profile_path),
				character: person.character
			})),
			crew: credits.crew.sort(sortByPopularity).map(person => (
			{
				id: person.id,
				name: person.name,
				image: formatImage(person.profile_path),
				department: person.department
			}))
		}
	}

	return movie
}