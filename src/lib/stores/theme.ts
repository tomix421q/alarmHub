import { writable } from 'svelte/store';

function createThemeStore() {
	const isBrowser = typeof window !== 'undefined';

	const storedTheme = isBrowser ? localStorage.getItem('theme') || 'light' : 'light';

	const { subscribe, set, update } = writable(storedTheme);

	if (isBrowser) {
		document.documentElement.classList.add(storedTheme);
	}

	return {
		subscribe,
		toggle: () =>
			update((currentTheme) => {
				const newTheme = currentTheme === 'light' ? 'dark' : 'light';

				if (isBrowser) {
					document.documentElement.classList.remove(currentTheme);
					document.documentElement.classList.add(newTheme);
					localStorage.setItem('theme', newTheme);
				}
				return newTheme;
			}),
		set: (value: string) => {
			if (isBrowser) {
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(value);
				localStorage.setItem('theme', value);
			}
			set(value);
		}
	};
}

export const theme = createThemeStore();
