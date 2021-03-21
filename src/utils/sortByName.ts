function sortByName(a: any, b: any)
{
	if (a.name === 'Not registered user' && b.name === 'Not registered user')
		return 0
	if ((a.name !== 'Not registered user' && b.name === 'Not registered user') || (a.name < b.name))
		return -1
	if ((a.name === 'Not registered user' && b.name !== 'Not registered user') || (a.name > b.name))
		return 1
	
	return 0
}

export default sortByName