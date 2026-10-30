const shellQuote = require('shell-quote');

/** Format a single simple POSIX command without introducing shell execution. */
export function formatCurl(text: string, splitCookies = false, splitData = false): string {
	// POSIX line continuations disappear except inside single quotes.
	let normalized = '';
	let single = false;
	let double = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === '\n' && !single && !double) { throw new Error('Only one curl command is supported'); }
		if (ch === '\\' && !single && text[i + 1] === '\n') { i++; continue; }
		if (ch === '\\' && !single && i + 1 < text.length) { normalized += ch + text[++i]; continue; }
		if (ch === "'" && !double) { single = !single; }
		if (ch === '"' && !single) { double = !double; }
		normalized += ch;
	}
	if (single || double) { throw new Error('Unable to parse curl command'); }
	let tokens: unknown[];
	try { tokens = shellQuote.parse(normalized, (name: string) => '$' + name); }
	catch { throw new Error('Unable to parse curl command'); }

	// shell-quote classifies even escaped URL query markers as globs. Treat
	// absolute HTTP(S) URLs as literal URLs; reject all other shell operators.
	tokens = tokens.map(token => {
		if (typeof token === 'object' && token !== null && 'op' in token &&
			token.op === 'glob' && 'pattern' in token && typeof token.pattern === 'string' &&
			/^https?:\/\//i.test(token.pattern)) { return token.pattern; }
		return token;
	});
	if (tokens.some(token => typeof token !== 'string')) {
		throw new Error('Shell operators, comments and glob expressions are not supported');
	}
	const args = tokens as string[];
	if (args.length === 0 || args[0] !== 'curl') {
		throw new Error('Expected a single curl command');
	}
	const quote = (value: string) => shellQuote.quote([value]);
	return args.map((value, index) => {
		const prev = args[index - 1];
		let delimiter: string | undefined;
		if (splitCookies && (prev === '-H' || prev === '--header') && /^cookie\s*:/i.test(value)) {
			delimiter = '; ';
		} else if (splitData && (prev === '--data' || prev === '--data-raw' || prev === '-d')) {
			delimiter = '&';
		}
		if (!delimiter || !value.includes(delimiter)) { return quote(value); }
		const pieces = value.split(delimiter);
		return pieces.map((piece, i) => quote(piece + (i < pieces.length - 1 ? delimiter : ''))).join('\\\n');
	}).join(' \\\n');
}
