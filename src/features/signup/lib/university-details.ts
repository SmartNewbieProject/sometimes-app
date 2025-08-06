export function filterDepartments(universities: string[], searchText: string) {
	const lowerText = searchText.toLowerCase();

	return (
		universities?.filter((department) => {
			return department.toLowerCase().includes(lowerText);
		}) ?? []
	);
}
