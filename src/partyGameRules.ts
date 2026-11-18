// Keep the browser UI and trusted game logic on the same prompts and rules.
// Cloud Functions remain the source of truth; this module preserves the
// existing client import path while avoiding a second editable copy.
export * from '../functions/src/partyGameRules.js';
