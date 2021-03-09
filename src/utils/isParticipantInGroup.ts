interface Participant
{
	email: string
	isOwner: boolean
	predictions: Array<
	{
		category: string
		guess: number
	}>
}

function isParticipantInGroup(email: string, participants: Participant[])
{
	let hasParticipant = false

	participants.map(participant =>
	{
		if (participant.email === email)
			hasParticipant = true
	})

	return hasParticipant
}

export default isParticipantInGroup