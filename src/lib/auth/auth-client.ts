import { createAuthClient } from 'better-auth/svelte';

const baseURL =
	process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.PROD_URL;

export const authClient = createAuthClient({
	/** the base url of the server (optional if you're using the same domain) */
	baseURL
});
