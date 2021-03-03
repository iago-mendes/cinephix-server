import {PersonCombinedCredits, PersonDetails} from '../../models/Person'
import formatImage from '../../utils/formatImage'
import sortByPopularity from '../../utils/sortByPopularity'
import api from '../api'

export const showCelebrity = async (id: number) =>
{
	try
	{
		const {data: rawCelebrity}:{data: PersonDetails} = await api.get(`/person/${id}`)
		const {data: credits}:{data: PersonCombinedCredits} = await api.get(`/person/${id}/combined_credits`)

		const celebrity =
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

		return celebrity
	}
	catch (error)
	{
		const celebrity =
		{
			id: 1,
			name: 'Celebrity not found',
			image: formatImage(undefined),
			biography: '',
			knownForDepartment: '',
			birthday: '',
			placeOfBirth: '',
			credits:
			{
				cast: [],
				crew: []
			}
		}

		return celebrity
	}
}