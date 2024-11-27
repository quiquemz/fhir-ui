export function loadConfig<TEnvironment>(
	path: string = '/config/config.json',
): Promise<TEnvironment | undefined> {
	return fetch(path, { headers: { 'cache-control': 'no-cache' } })
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				console.error(
					'Fetching configuration did not return a successful response',
				);
				return undefined;
			}
		})
		.catch((error) => {
			console.error('Error loading configuration', { error });
			return undefined;
		});
}
