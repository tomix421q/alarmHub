import { UPLOAD_PHOTO_NOTE_ABSOLUTE as UPLOAD_DIR } from '$env/static/private';
import { error } from '@sveltejs/kit';
// Nástroje z Node.js na bezpečnú prácu s cestami k súborom.
import { resolve, join } from 'path';
// Nástroje z Node.js na prácu so súborovým systémom (čítanie, kontrola existencie).
import { readFileSync, existsSync } from 'fs';
// Knižnica, ktorá zistí typ súboru podľa prípony (napr. .png -> image/png).
import mime from 'mime-types';

// 2. Definujeme funkciu pre GET požiadavky
// ----------------------------------------------------------------
// `export function GET` znamená, že tento kód sa spustí vždy,
// keď prehliadač pošle GET požiadavku na URL, ktorá sem smeruje
// (napr. keď načíta <img src="/uploads/obrazok.png">).
export function GET({ params }) {
	// `params.path` obsahuje časť URL, ktorá sa zhoduje s `[...path]`.
	// Ak je URL `/uploads/obrazok123.png`, tak `params.path` bude "obrazok123.png".

	const filePath = params.path;

	// 3. Bezpečne zostavíme cestu k súboru na disku
	// ----------------------------------------------------------------
	// `join` bezpečne spojí cestu k tvojmu adresáru a názov požadovaného súboru.
	const safeJoinPath = join(UPLOAD_DIR, filePath);
	// `resolve` premení túto spojenú cestu na finálnu, absolútnu cestu,
	// ktorú operačný systém chápe. Zároveň vyčistí pokusy o útok, napr. `../`.
	const fileFullPath = resolve(safeJoinPath);

	// 4. Kľúčová bezpečnostná kontrola
	// ----------------------------------------------------------------
	// Toto je najdôležitejšia časť. Overíme, či finálna cesta k súboru
	// stále začína cestou k nášmu povolenému adresáru.
	// Zabraňuje to útokom, kde by sa niekto snažil dostať k súborom mimo
	// upload priečinku, napr. zadaním URL `/uploads/../../.env`.
	if (!fileFullPath.startsWith(resolve(UPLOAD_DIR))) {
		throw error(403, 'Forbidden'); // Ak nie, prístup je zakázaný.
	}

	// 5. Skontrolujeme, či súbor vôbec existuje
	// ----------------------------------------------------------------
	if (!existsSync(fileFullPath)) {
		throw error(404, 'Not Found'); // Ak nie, pošleme chybu 404.
	}

	// 6. Pokúsime sa načítať a poslať súbor
	// ----------------------------------------------------------------
	try {
		// Načítame celý obsah súboru z disku do pamäte servera ako "Buffer".
		const fileBuffer = readFileSync(fileFullPath);
		// Pomocou `mime-types` zistíme správny Content-Type.
		const contentType = mime.lookup(fileFullPath) || 'application/octet-stream';

		// Vrátime novú `Response`. Toto je výsledok, ktorý dostane prehliadač.
		return new Response(fileBuffer, {
			status: 200, // Všetko je v poriadku.
			headers: {
				// Povieme prehliadaču, aký typ dát mu posielame.
				'Content-Type': contentType,
				// Povieme prehliadaču, aby si tento súbor uložil do cache
				// na veľmi dlho (1 rok). Ak ho bude potrebovať znova,
				// použije lokálnu kópiu a nebude sa pýtať servera.
				// To extrémne zrýchľuje načítavanie stránky.
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (e) {
		// Ak nastane akákoľvek iná chyba pri čítaní súboru,
		// zalogujeme ju na serveri a pošleme všeobecnú chybu 500.
		console.error('Error reading file:', e);
		throw error(500, 'Internal Server Error');
	}
}
