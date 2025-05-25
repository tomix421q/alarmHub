import Markdoc from '@markdoc/markdoc';
import type { messageAlertType, statusType } from './types/serverTypes';
import { goto } from '$app/navigation';

// WHEN OLD MESSAGE DELELETE?
export const MESSAGE_EXPIRY = 5000;

// CURRENT TIME
export function getCurrentTimestamp() {
	return Date.now();
}

// MARKDOC
export function renderMarkdoc(content: string) {
	const ast = Markdoc.parse(content);
	const transformed = Markdoc.transform(ast);
	const html = Markdoc.renderers.html(transformed);
	return html;
}

// PAGE URL
export function goToPage(p: number) {
	const url = new URL(window.location.href);
	const actualPage = url.searchParams.get('page');
	if (Number(actualPage) === 1) return;
	url.searchParams.set('page', p.toString());
	// window.location.href = url.toString();
	goto(url.pathname + url.search, { keepFocus: true, noScroll: true, replaceState: true });
}
