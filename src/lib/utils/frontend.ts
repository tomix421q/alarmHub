import Markdoc from '@markdoc/markdoc';
import type { messageAlertType } from './types/serverTypes';

// WHEN OLD MESSAGE DELELETE?
export const MESSAGE_EXPIRY = 5000;

// CURRENT TIME
export function getCurrentTimestamp() {
	return Date.now();
}

//CHECK MESSAGE IF EXPIRY
export function checkExpiredMessages({ messages }: { messages: messageAlertType[] }) {
	const now = getCurrentTimestamp();
	const freshMessages = messages.filter((msg) => msg.timeStamp.getTime() + MESSAGE_EXPIRY > now);
	if (freshMessages.length !== messages.length) {
		messages = freshMessages;
	}
}

// MARKDOC
export function renderMarkdoc(content: string) {
	const ast = Markdoc.parse(content);
	const transformed = Markdoc.transform(ast);
	const html = Markdoc.renderers.html(transformed);
	return html;
}
