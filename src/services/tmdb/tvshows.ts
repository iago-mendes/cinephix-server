import {TvCredits, TvDetails} from '../../models/Tv'
import formatImage from '../../utils/formatImage'
import sortByPopularity from '../../utils/sortByPopularity'
import api from '../api'

export const showTvshow = async (id: number) =>
{
	const {data: rawTvshow}:{data: TvDetails} = await api.get(`/tv/${id}`)
	const {data: credits}:{data: TvCredits} = await api.get(`/tv/${id}/credits`)

	const tvshow =
	{
		id: rawTvshow.id,
		title: rawTvshow.name,
		image: formatImage(rawTvshow.poster_path),
		overview: rawTvshow.overview,
		rating: rawTvshow.vote_average,
		status: rawTvshow.status,
		inProduction: rawTvshow.in_production,
		startDate: rawTvshow.first_air_date,
		endDate: rawTvshow.last_air_date,
		seasonsNumber: rawTvshow.number_of_seasons,
		episodesNumber: rawTvshow.number_of_episodes,
		genres: rawTvshow.genres,
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

	return tvshow
}