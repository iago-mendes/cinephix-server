import {TvCredits, TvDetails} from '../../models/Tv'
import formatImage from '../../utils/formatImage'
import sortByPopularity from '../../utils/sortByPopularity'
import api from '../api'
import getCache from '../cache/get'
import saveCache from '../cache/save'

interface Tvshow
{
	id?: number
	title?: string
	image?: string
	overview?: string
	rating?: number
	status?: string
	inProduction?: boolean
	startDate?: string
	endDate?: string
	seasonsNumber?: number
	episodesNumber?: number
	genres?: Array<
	{
		id?: number
    name?: string
	}>
	credits:
	{
		cast: Array<
		{
			id?: number
			name?: string
			image?: string
			character?: string
		}>
		crew: Array<
		{
			id?: number
			name?: string
			image?: string
			department?: string
		}>
	}
}

export const showTvshow = async (id: number) =>
{
	const cachedTvshow: Tvshow | null = await getCache('tvshow', id)
	if (cachedTvshow !== null)
		return cachedTvshow

	const {data: rawTvshow}:{data: TvDetails} = await api.get(`/tv/${id}`)
	const {data: credits}:{data: TvCredits} = await api.get(`/tv/${id}/credits`)

	const tvshow: Tvshow =
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

	saveCache('tvshow', id, tvshow)

	return tvshow
}