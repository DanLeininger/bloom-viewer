import path from 'path';
import { env } from '$env/dynamic/private';
import { DEFAULT_TRANSCRIPT_DIR } from '$lib/shared/constants';

/**
 * The absolute path to the base transcript directory.
 * Resolved once at startup from the TRANSCRIPT_DIR environment variable or a default.
 *
 * `$env/dynamic/private` is read so this honors a `.env` file during `npm run dev`
 * as well as a real `TRANSCRIPT_DIR` set in the environment (CLI / standalone node
 * server). We fall back to raw `process.env` for safety.
 */
export const TRANSCRIPT_DIR = path.resolve(
	env.TRANSCRIPT_DIR || process.env.TRANSCRIPT_DIR || DEFAULT_TRANSCRIPT_DIR
);

console.log(`[CONFIG] Transcript directory resolved to: ${TRANSCRIPT_DIR}`);
