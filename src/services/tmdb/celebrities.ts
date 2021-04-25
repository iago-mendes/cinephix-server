import {PersonCombinedCredits, PersonDetails} from '../../models/Person'
import formatImage from '../../utils/formatImage'
import sortByPopularity from '../../utils/sortByPopularity'
import api from '../api'
import getCache from '../cache/get'
import saveCache from '../cache/save'

interface Celebrity
{
	id?: number
	name?: string
	image?: string
	biography?: string
	knownForDepartment?: string
	birthday?: string
	placeOfBirth?: string
	credits:
	{
		cast: Array<
		{
			id?: number
			title?: string
			image?: string
			character?: string
			overview?: string
			date?: string
			type?: string
		}>
		crew: Array<
		{
			id?: number
			title?: string
			image?: string
			overview?: string
			date?: string
			department?: string
			type?: string
		}>
	}
}

export const showCelebrity = async (id: number) =>
{
	const cachedCelebrity: Celebrity | null = await getCache('celebrity', id)
	if (cachedCelebrity !== null)
		return cachedCelebrity

	const {data: rawCelebrity}:{data: PersonDetails} = await api.get(`/person/${id}`)
	const {data: credits}:{data: PersonCombinedCredits} = await api.get(`/person/${id}/combined_credits`)

	const celebrity: Celebrity =
	{
		id: rawCelebrity.id,
		name: rawCelebrity.name,
		image: formatImage(rawCelebrity.profile_path),
		biography: rawCelebrity.biography,
		knownForDepartment: rawCelebrity.known_for_department,
		birthday: rawCelebrity.birthday,
		placeOfBirth: rawCelebrity.place_of_birth,
		credits:
		{
			cast: credits.cast.sort(sortByPopularity).map(media => (
			{
				id: media.id,
				title: media.media_type === 'movie' ? media.title : media.name,
				image: formatImage(media.poster_path),
				character: media.character,
				overview: media.overview,
				date: media.media_type === 'movie' ? media.release_date : media.first_air_date,
				type : media.media_type === 'movie' ? 'movie' : 'tvshow'
			})),
			crew: credits.crew.sort(sortByPopularity).map(media => (
			{
				id: media.id,
				title: media.media_type === 'movie' ? media.title : media.name,
				image: formatImage(media.poster_path),
				overview: media.overview,
				date: media.media_type === 'movie' ? media.release_date : media.first_air_date,
				department: media.department,
				type : media.media_type === 'movie' ? 'movie' : 'tvshow'
			}))
		}
	}

	saveCache('celebrity', id, celebrity)

	return celebrity
}